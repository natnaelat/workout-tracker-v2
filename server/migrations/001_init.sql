CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub     VARCHAR(255) UNIQUE NOT NULL,
  email           VARCHAR(255) NOT NULL,
  sex             VARCHAR(10),
  birth_date      DATE,
  preferred_unit  VARCHAR(3) NOT NULL DEFAULT 'lbs',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE body_weight_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(6,2) NOT NULL,
  weight_lbs  NUMERIC(6,2) NOT NULL,
  logged_on   DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE workout_sets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id   UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg     NUMERIC(6,2) NOT NULL,
  weight_lbs    NUMERIC(6,2) NOT NULL,
  unit_entered  VARCHAR(3) NOT NULL DEFAULT 'lbs',
  set_number    INTEGER NOT NULL,
  reps          INTEGER NOT NULL,
  performed_on  DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_workout_sets_exercise_date ON workout_sets(exercise_id, performed_on DESC);
CREATE INDEX idx_body_weight_logs_user_date ON body_weight_logs(user_id, logged_on DESC);