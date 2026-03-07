-- Enable Realtime for core queue tables
-- This must be run in the Supabase SQL Editor

-- 1. Enable replication for the Appointment table
alter publication supabase_realtime add table "Appointment";

-- 2. Enable replication for the QueueTicket table
alter publication supabase_realtime add table "QueueTicket";

-- 3. (Optional) If you want to listen to Profile status changes
alter publication supabase_realtime add table "Profile";

-- 4. Set replica identity to full to ensure all columns are available in payloads
alter table "Appointment" replica identity full;
alter table "QueueTicket" replica identity full;
