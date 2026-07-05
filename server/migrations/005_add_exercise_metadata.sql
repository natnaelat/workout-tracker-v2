ALTER TABLE exercises
ADD COLUMN category VARCHAR(20),
ADD COLUMN standard_exercise VARCHAR(100),
ADD COLUMN equipment VARCHAR(20);

CREATE TABLE cardio_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id   UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  distance      NUMERIC(8,2),
  distance_unit VARCHAR(2) NOT NULL DEFAULT 'mi',
  duration_mins INTEGER NOT NULL,
  performed_on  DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cardio_logs_exercise_id ON cardio_logs(exercise_id);
CREATE INDEX idx_cardio_logs_user_id ON cardio_logs(user_id);