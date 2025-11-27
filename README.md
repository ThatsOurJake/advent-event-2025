# Advent Event 2025

This readme contains all you might want to know about this game event.

## The concept
This years event main aim is to promote teamwork in which each player gets separated into one of the three elf factions, red, green, blue. The players are then to work together to load presents onto the sleigh through four actions
- Mining ore
- Forging ore
- Wrapping gifts
- Loading onto the sleigh
The catch is each day there are only 3 action points so a player has to choose which tasks they want to spend these points on, is it mine 3 ore or wrap 2 presents and forge one ore into a gift mound. The second catch is, what is produced today does not become available until the next day of the event.

The event is to also run for a short length of time to try and keep engagement high.

## The implementation
The solution created is a NextJS app using Redis and Mongo for the datastores. This years event also uses Azure AD (Microsoft Entra) to allow users to sign in instead of remembering a GUID like previous years. The tech stack was selected because there were a few problems I needed to try circumvent:
- Concurrency of players
- People losing interest
- Trying to ensure team points near the end feel close and with hopes one team doesn't steam ahead.

### Concurrency of players
With the event being an event in which in theory could have multiple teams members interacting at the same time, I wanted to ensure there was no duplication of resources. Whilst this was unlikely to occur with the small amount of people within the office, I still felt like I needed to circumvent this. This is where redis comes in, redis being atomic (which only processes one request before moving onto the next) means I can do checks and if someone was to do an action just before someone else, redis would process that first, then when the second player checks if this action is possible the value has already been updated. We also take advantage of lua scripts for when we assign the teams, this is because we need to do two operations under one action, check for the lowest team and then increase that team count by 1, therefore if 10 people have loaded the site each one should be assigned to a team one by one in a round robin fashion. Mongo is then used to store more static data and user data in which the operations can be slower. When a user finishes a task both mongo and redis are updated with the new values, this allows the app to use redis for quick lookups whilst mongo being our source of truth for the overall event.

### Retention and interest
Over the last 2 advent events and it being the christmas season I have noticed that people do lose interest, which is totally fine as I am the same with games too. However I wanted to try combat this in a few ways and try to keep players engaged but if the players did drop off that the teams those players were part of weren't at a disadvantage. To try combat the engagement of players I wanted the tasks to be short and engaging, I tried to take inspiration from "Among us" in which you do a short task and move onto the next, the user has three action points, I didn't want the tasks to be laborious like solving a whole crossword and feel more like a doing your dailies in a gacha game. I was also aiming that all the games are winnable but if you tried to cheat them you'd lose but still losing an action point in the process.

**The mines** in which the pickaxe slides side to side and the aim is to stop it within the green zone. Landing within the zone is a win and outside is a fail.

**The forge** in which the ore will appear on screen and must be clicked, this game has a random selection of "beat" maps resembled as "x--x-xx" where "-" is a break and "x" is a hit. There is a threshold in which the ore needs to be clicked to the animation and an accuracy calculated. I made this accuracy 60% because I am hoping it's low enough for a few miss clicks to allow the player to still win but still high enough to catch spam clicking.

**Wrapping station** this game the player will recreate the gift using buttons provided, this game was aimed to be the easiest as it's a bridging gap before the teams can score points.

**The sleigh** this game was inspired by the japanese peg games, the random bounces are to add some slight difficulty in catching the gifts.

All these games as mentioned main aim is to make the players feel like they're part of a wider factory.

### Balancing the game
One of the things I've tried for this event is balancing to ensure that each team finishes closely and that there is no front runners, the scores aren't seen by the players till the end but I didn't want the event to end and players feel dejected. With this write-up being done before the event has started I am yet to know if I was successful but I will explain how I've tried to do this and also how I have tested this.

First thing as mentioned above there is a background process that runs at 1am each day of the event and processes the previous night actions. So if the process runs on the 2nd, it will process the actions of the 1st. This process also will only run during the days the players can play the event. This process that runs is suppose to simulate player activity as well as set the current days event in motion.

The simulated player process is know as the "Night Elves" the code will calculate how many action points weren't used as well as if the teams were unbalanced (5 players on one and 8 on the other) how many extra actions points are needed to fill in those missing players. Once the points are calculated each one of them is "spent" one by one by selecting from the same actions the user can do, like mining, forging, wrapping and loading on to the sleigh. There is then a 20% chance this task could fail just like a player could in reality fail a task. Once all the points are spent the background process will do its other tasks of resetting the action points back to 3 and moving the values of the redis keys of the collected resources into mongo for total count of collected resources.

The game also has the concept of events, in which certain days an event to shake up the overall event could happen. This could be a location being closed or a chance of gaining extra resources from one action. The thing to note here is the client is still not telling the server how many resources the player got, we have a seeded rng function which is replayed upon submission with the same seed, this way the client and server have the same value when it comes to how many resources were gained.

The final part of all this is how I tested the balancing, I could simulate running the background process which would play the game out completely with night elves, so I loaded each team with 5 elves and played through each day making note of the resources stored and overall score to try see if players played to what I have coded as what I thought would be the most efficient way to play how close would the scores at the end be. These scores were very similar with there being an overall winning team so I'm hoping this plays out in the real event too.

### Worth noting
As with any project I have done for the workplace there are corners cut, this can be due to (rightly so) red tape that doesn't let me do certain things or I not wanting to waste company resource on silly ideas. The main thing each time are assets. Assets should really be hosted behind a CDN and not baked into the final docker image as it can bloat the size. As mentioned I didn't want to host these in CMS and have my own space etc taking away from actual company resource, so they are baked into the container. However the assets being served are slow from the internal cloud hosting platform. So I make heavy use of caching both from the server response and service workers. Also in previous events I've overloaded the dicebear api when loading a full screen of participants so caching has been a big focus.

When we fetch the avatars across the 2 instances of the app, axios will cache this response in memory, this is particularly helpful as everyone has their own unique avatar face. As soon as the player requests theirs the instance will remember their face, this therefore means the "teams" page that shows all the faces is quicker and nicer to dicebear because these responses are in cache. This endpoint then returns a cache time of 2 days to the client ensuring the browser then remembers these faces.

The other cache mentioned was service workers, because NextJS still haven't got their stuff sorted out for this proxy/middleware file, I had to look at a way of intercepting requests to to the assets to cache them. Now NextJS also recommend using a CDN, but the easiest way would have been to add a middleware match `/static` and send cache-headers down. I couldn't do this as the middelware/proxy file is being used to intercept requests to ensure the players are signed in via Entra. So the next step was to intercept these via the service-worker and cache these on the browser for 48 hours also. The service worker intercepts the requests to `/static/*` checks if it's cached, if so return that, if not do the request, on the way back add a header of when it was cached so we can bust it on future requests if that time has passed.

The final thing was remembering 4mb assets 1024xN assets can be a. compressed and b. downscaled when the assets is going to be displayed a 400px wide box.

## Credits
This section contains links to assets I had used on the site that required credit attribution:
- https://www.flaticon.com/authors/wanicon
- https://www.flaticon.com/authors/iconic-panda
- https://www.freepik.com
- https://www.flaticon.com/authors/san-d
- https://www.flaticon.com/authors/muhammad-waqas-khan
- https://www.vecteezy.com/vector-art/33216107-seamless-pattern-of-cute-frog-wear-scarf-sit-in-circle-background-reptile-animal-character-cartoon-design-baby-clothing-kawaii-vector-illustration
- https://www.shutterstock.com/search/cute-stars-pattern
- [Christmas tree icons created by Aranagraphics - Flaticon](https://www.flaticon.com/free-icons/christmas-tree)
