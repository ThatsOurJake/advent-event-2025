local key = KEYS[1]
local amount = tonumber(ARGV[1])

if redis.call("EXISTS", key) == 0 then
  return 0  -- key doesn't exist
end

local current = tonumber(redis.call("GET", key) or "0")
if current > 0 then
  redis.call("DECRBY", key, amount)
  return 1  -- success
else
  return 0  -- not enough resource
end
