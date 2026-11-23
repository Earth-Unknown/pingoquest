# Presentes entre amigos: base para o Supabase

Hoje os presentes são **de mentira**: tudo roda no navegador, dentro do objeto `GiftAPI` (em `src/jogo.html`), que guarda os dados em `S.gifts` e devolve `Promise`.
Quando o Supabase existir, só `GiftAPI.send`, `GiftAPI.inbox` e `GiftAPI.claim` precisam ser trocados por chamadas ao servidor. A tela não muda.

## Regras do produto
- Dá para presentear: **energia**, **chips** e **itens de evento** (os itens de progresso voltam sozinhos para quem cumpre a meta, então não podem ser dados).
- Quem dá perde o que deu (energia e chips saem do saldo; item sai do inventário).
- Só entre amigos que se seguem. Quem recebe abre o presente (claim) e só então o saldo muda.
- Quantidades fixas: energia 10/25/50, chips 10/20/50. Limite sugerido: 3 presentes por dia para cada amigo.
- Se quem recebe já tem o item, ganha 20 chips no lugar.

## Tabelas
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  nick text not null unique check (char_length(nick) between 2 and 14),
  code text not null unique,            -- código do link de convite
  created_at timestamptz default now()
);

create table friendships (
  user_id uuid references profiles on delete cascade,
  friend_id uuid references profiles on delete cascade,
  status text not null default 'accepted' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table wallets (                  -- saldo oficial (o servidor manda, não o aparelho)
  user_id uuid primary key references profiles on delete cascade,
  energia int not null default 0 check (energia >= 0),
  chips int not null default 0 check (chips >= 0)
);

create table inventory (
  user_id uuid references profiles on delete cascade,
  item_key text not null,
  primary key (user_id, item_key)
);

create table gifts (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references profiles,
  to_id uuid not null references profiles,
  type text not null check (type in ('energia','chips','item')),
  amount int not null default 0 check (amount >= 0),
  item_key text,
  msg text check (char_length(msg) <= 40),
  status text not null default 'sent' check (status in ('sent','claimed')),
  created_at timestamptz default now(),
  claimed_at timestamptz
);
create index on gifts (to_id, status);
```

## Funções (atômicas, rodam no servidor)
```sql
create or replace function send_gift(p_to uuid, p_type text, p_amount int, p_item text, p_msg text)
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); gid uuid;
begin
  if not exists (select 1 from friendships where user_id = me and friend_id = p_to and status = 'accepted')
    then raise exception 'not_friends'; end if;
  if (select count(*) from gifts where from_id = me and to_id = p_to and created_at > now() - interval '1 day') >= 3
    then raise exception 'daily_limit'; end if;
  if p_type = 'energia' then
    if p_amount not in (10,25,50) then raise exception 'bad_amount'; end if;
    update wallets set energia = energia - p_amount where user_id = me and energia >= p_amount;
    if not found then raise exception 'no_balance'; end if;
  elsif p_type = 'chips' then
    if p_amount not in (10,20,50) then raise exception 'bad_amount'; end if;
    update wallets set chips = chips - p_amount where user_id = me and chips >= p_amount;
    if not found then raise exception 'no_balance'; end if;
  elsif p_type = 'item' then
    delete from inventory where user_id = me and item_key = p_item;   -- só itens marcados como dáveis (evento)
    if not found then raise exception 'no_item'; end if;
  else raise exception 'bad_type'; end if;
  insert into gifts (from_id, to_id, type, amount, item_key, msg)
    values (me, p_to, p_type, p_amount, p_item, left(p_msg, 40)) returning id into gid;
  return gid;
end $$;

create or replace function claim_gift(p_id uuid)
returns gifts language plpgsql security definer set search_path = public as $$
declare g gifts; me uuid := auth.uid();
begin
  select * into g from gifts where id = p_id and to_id = me and status = 'sent' for update;
  if not found then raise exception 'not_found'; end if;
  if g.type = 'energia' then update wallets set energia = energia + g.amount where user_id = me;
  elsif g.type = 'chips' then update wallets set chips = chips + g.amount where user_id = me;
  else
    if exists (select 1 from inventory where user_id = me and item_key = g.item_key)
      then update wallets set chips = chips + 20 where user_id = me;     -- já tinha o item
      else insert into inventory (user_id, item_key) values (me, g.item_key); end if;
  end if;
  update gifts set status = 'claimed', claimed_at = now() where id = p_id returning * into g;
  return g;
end $$;
```

## Segurança (RLS)
```sql
alter table profiles enable row level security;
alter table friendships enable row level security;
alter table wallets enable row level security;
alter table inventory enable row level security;
alter table gifts enable row level security;

create policy "ver perfis" on profiles for select using (auth.uid() is not null);
create policy "editar meu perfil" on profiles for update using (id = auth.uid());
create policy "minhas amizades" on friendships for select using (user_id = auth.uid());
create policy "meu saldo" on wallets for select using (user_id = auth.uid());
create policy "meu inventario" on inventory for select using (user_id = auth.uid());
create policy "presentes meus" on gifts for select using (from_id = auth.uid() or to_id = auth.uid());
-- sem policies de insert/update em wallets, inventory e gifts: só as funções acima mexem neles.
```

## Trocar a prévia pelo real
- `GiftAPI.send(to, g)` → `supabase.rpc('send_gift', {p_to, p_type, p_amount, p_item, p_msg})`
- `GiftAPI.inbox()` → `from('gifts').select('*, from:profiles!from_id(nick)').eq('status','sent')`
- `GiftAPI.claim(id)` → `supabase.rpc('claim_gift', {p_id})`
- Depois de cada chamada, recarregar `wallets` e `inventory` para atualizar o saldo na tela.
