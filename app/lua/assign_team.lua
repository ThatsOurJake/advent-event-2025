local red_team = tonumber(redis.call("GET", "team:red_count") or 0)
local green_team = tonumber(redis.call("GET", "team:green_count") or 0)
local blue_team = tonumber(redis.call("GET", "team:blue_count") or 0)

local min_count = red_team;
local chosen = "red";

if green_team < min_count then
  min_count = green_team
  chosen = "green"
end

if blue_team < min_count then
  min_count = blue_team
  chosen = "blue"
end

redis.call('INCR', "team:" .. chosen .. "_count")

return chosen;
