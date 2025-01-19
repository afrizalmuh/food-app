CREATE TYPE gender_enum AS ENUM ('laki-laki', 'perempuan');

CREATE TYPE reward_type_enum AS ENUM ('discount', 'free_item');

CREATE TYPE discount_type_enum AS ENUM ('percentage', 'amount');

CREATE TYPE customer_target_type_enum AS ENUM ('new_user', 'all', 'specific_city', 'loyal_user');

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE area (
  area_id SERIAL PRIMARY KEY,
  area_name VARCHAR(255) NOT NULL,
  area_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP null,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR NULL
);

CREATE TABLE customer (
  customer_id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NULL,
  gender gender_enum,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NULL,
  area_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR NULL
);


CREATE TABLE menu_category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR unique NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP null,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR NULL
);

create table menu (
  menu_id SERIAL PRIMARY KEY,
  category_id int NOT NULL,
  menu_name varchar unique not null,
  sell_price int not null,
  avaibility bool not null default true,
  description text null,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP null,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR null
)

create table promotion_header (
	promotion_id serial primary key,
	promotion_name varchar not null,
	start_date date not null,
	end_date date,
	quota int default 0,
	is_expired bool default false,
	minimum_spending int default 0,
	max_usage_limit int default 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP null,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR null
);

create table promotion_menu_rules (
	promotion_menu_rule_id serial primary key,
	promotion_id INT NOT null,
	target_id INT NOT null,
	quantity int not null default 0,
	FOREIGN KEY (promotion_id) REFERENCES promotion_header(promotion_id) ON DELETE CASCADE
)

create table promotion_usage (
  promotion_usage_id serial primary key,
  promotion_id INT NOT null,
  order_id INT not null,
  contact_id INT NOT null,
  total_discount int not null,
	FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
)

create table promotion_usage_detail (
  promotion_usage_detail_id serial primary key,
  promotion_usage_id INT NOT null,
  menu_id INT not null,
  qty INT NOT null,
  FOREIGN KEY (promotion_usage_id) REFERENCES promotion_usage(promotion_usage_id) ON DELETE CASCADE
)

create table promotion_rewards (
	promotion_reward_id serial primary key,
	promotion_id INT NOT NULL,
	reward_type reward_type_enum,
	discount_type discount_type_enum,
	discount_amount int,
	max_discount_amount int,
	FOREIGN KEY (promotion_id) REFERENCES promotion_header(promotion_id) ON DELETE CASCADE
);

create table promotion_reward_menu(
	promotion_reward_menu_id serial primary key,
	promotion_reward_id INT NOT NULL,
	target_id INT NOT null,
	quantity int,
	FOREIGN KEY (promotion_reward_id) REFERENCES promotion_rewards(promotion_reward_id) ON DELETE CASCADE
);

create table promotion_customer (
	promotion_customer_id serial primary key,
	promotion_id INT NOT null,
	target_id int not null,
	target_type customer_target_type_enum default 'all',
	FOREIGN KEY (promotion_id) REFERENCES promotion_header(promotion_id) ON DELETE CASCADE
)

create table orders (
	order_id serial primary key,
	order_no varchar not null unique,
	total_disc int not null,
	subtotal int not null,
	notes text,
	customer_id int not null,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_at TIMESTAMP null,
  created_by VARCHAR NOT NULL,
  updated_by VARCHAR null
)

create table order_menu (
	order_menu_id serial primary key,
	order_id int not null,
	menu_id int not null,
	quantity int not null,
	sell_price int not null,
	FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);