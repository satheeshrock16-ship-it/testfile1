import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL="https://lpqdnmaaykeyklfdfzdl.supabase.co";
const SUPABASE_KEY="sb_publishable_MpTMTeTLJ74A5gm8QHs2kA_Z0aETuMX";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id),fmt=n=>Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
let day=key(new Date()),user=null,roomId=null,room=null,people=[],meals=[],peopleChannel,mealChannel,authMode="signin";
const indianFoods={
/* Breakfast & South Indian */
"Idli (1)":60,"Idli (2)":120,"Idli (3)":180,"Mini idli (10)":200,"Kanchipuram idli (1)":140,
"Plain dosa (1)":170,"Masala dosa (1)":350,"Paper dosa (1)":300,"Ghee dosa (1)":300,"Butter dosa (1)":300,
"Onion dosa (1)":250,"Tomato dosa (1)":220,"Podi dosa (1)":260,"Mysore masala dosa (1)":400,"Rava dosa (1)":220,
"Onion rava dosa (1)":260,"Neer dosa (2)":180,"Set dosa (2)":300,"Appam (1)":120,"Idiyappam/string hoppers (2)":180,
"Pesarattu (1)":180,"Adai (1)":220,"Uttapam plain (1)":180,"Onion uttapam (1)":230,"Vegetable uttapam (1)":240,
"Medu vada (1)":140,"Medu vada (2)":280,"Masala vada (1)":110,"Masala vada (2)":220,"Sambar vada (1)":200,
"Sambar (1 cup)":120,"Sambar (2 cups)":240,"Coconut chutney (2 tbsp)":80,"Tomato chutney (2 tbsp)":45,
"Mint chutney (2 tbsp)":30,"Peanut chutney (2 tbsp)":90,"Onion chutney (2 tbsp)":45,"Pudina chutney (2 tbsp)":30,
"Ven pongal (1 cup)":280,"Ven pongal (1.5 cups)":420,"Khara pongal (1 cup)":280,"Millet pongal (1 cup)":260,
"Sweet pongal (1 cup)":330,"Kesari bath (1 cup)":300,"Rava kesari (1/2 cup)":150,"Upma (1 cup)":230,
"Vegetable upma (1 cup)":250,"Rava upma (1 cup)":230,"Oats upma (1 cup)":220,"Poha/aval upma (1 cup)":250,
"Poha (1 cup)":250,"Vegetable poha (1 cup)":270,"Bread omelette (2 bread + 2 eggs)":360,
"Egg dosa (1)":250,"Egg parotta (1)":400,"Poori (1)":150,"Poori (2)":300,"Poori masala (2 pooris)":420,
"Chapati (1)":110,"Chapati (2)":220,"Phulka (1)":90,"Paratha plain (1)":220,"Aloo paratha (1)":280,
"Paneer paratha (1)":320,"Gobi paratha (1)":280,"Methi paratha (1)":230,"Stuffed paratha (1)":280,
"Parotta (1)":300,"Parotta (2)":600,"Kothu parotta veg (1 plate)":500,"Kothu parotta egg (1 plate)":600,
"Kothu parotta chicken (1 plate)":700,"Paniyaram (5)":250,"Kuzhi paniyaram (8)":320,"Puttu (1 cup)":280,
"Puttu with kadala curry (1 serving)":480,"Idiyappam with coconut milk (1 serving)":350,
/* Rice, lunch mains & tiffin */
"Plain rice cooked (1 cup)":205,"Plain rice cooked (1.5 cups)":310,"Brown rice cooked (1 cup)":215,
"Hand-pounded rice cooked (1 cup)":210,"Red rice cooked (1 cup)":215,"Millet cooked (1 cup)":200,
"Jeera rice (1 cup)":250,"Veg pulao (1 cup)":300,"Vegetable pulao (1 plate)":450,"Peas pulao (1 cup)":280,
"Paneer pulao (1 cup)":350,"Mushroom rice (1 cup)":300,"Tomato rice (1 cup)":280,"Lemon rice (1 cup)":280,
"Coconut rice (1 cup)":330,"Tamarind rice (1 cup)":300,"Curd rice (1 cup)":250,"Curd rice (1.5 cups)":375,
"Mint rice (1 cup)":280,"Coriander rice (1 cup)":280,"Methi rice (1 cup)":280,"Capsicum rice (1 cup)":280,
"Vegetable biryani (1 cup)":330,"Veg biryani (1 plate)":450,"Chicken biryani (1 cup)":430,"Chicken biryani (1 plate)":600,
"Mutton biryani (1 plate)":650,"Egg biryani (1 plate)":550,"Fish biryani (1 plate)":600,"Prawn biryani (1 plate)":620,
"Hyderabadi chicken biryani (1 plate)":650,"Ambur chicken biryani (1 plate)":600,"Dindigul chicken biryani (1 plate)":620,
"Chicken rice (1 plate)":500,"Egg rice (1 plate)":480,"Veg fried rice (1 plate)":450,"Chicken fried rice (1 plate)":550,
"Egg fried rice (1 plate)":520,"Schezwan veg fried rice (1 plate)":500,"Schezwan chicken fried rice (1 plate)":600,
"Dal rice (1 cup)":300,"Sambar rice (1 cup)":300,"Sambar rice (1.5 cups)":450,"Rasam rice (1 cup)":270,
"Bisibele bath (1 cup)":300,"Vangi bath (1 cup)":300,"Kara bath (1 cup)":250,"Puliyodarai (1 cup)":300,
/* Dal, gravies & vegetarian sides */
"Dal (1 cup)":180,"Dal fry (1 cup)":220,"Dal tadka (1 cup)":240,"Moong dal (1 cup)":190,"Masoor dal (1 cup)":190,
"Toor dal (1 cup)":200,"Chana dal (1 cup)":210,"Rajma (1 cup)":220,"Rajma masala (1 cup)":280,
"Chole/chana masala (1 cup)":280,"Kala chana curry (1 cup)":250,"Green gram curry (1 cup)":220,
"White chana sundal (1 cup)":230,"Black chana sundal (1 cup)":230,"Moong dal sundal (1 cup)":210,
"Sambar (1 cup)":120,"Rasam (1 cup)":70,"Pepper rasam (1 cup)":70,"Tomato rasam (1 cup)":65,"Mysore rasam (1 cup)":80,
"Vegetable kurma (1 cup)":250,"Mixed veg kurma (1 cup)":260,"Navratan korma (1 cup)":330,"Avial (1 cup)":180,
"Mor kuzhambu (1 cup)":150,"Kara kuzhambu (1 cup)":180,"Vatha kuzhambu (1 cup)":190,"Puli kuzhambu (1 cup)":180,
"Ennai kathirikai (1 cup)":220,"Brinjal curry (1 cup)":180,"Drumstick curry (1 cup)":160,"Vendakkai curry (1 cup)":170,
"Okra/bhindi fry (1 cup)":220,"Beans poriyal (1 cup)":150,"Carrot beans poriyal (1 cup)":160,"Cabbage poriyal (1 cup)":140,
"Cauliflower poriyal (1 cup)":150,"Cauliflower curry (1 cup)":180,"Broccoli stir fry (1 cup)":130,
"Potato fry (1 cup)":280,"Potato roast (1 cup)":260,"Aloo jeera (1 cup)":220,"Aloo gobi (1 cup)":220,
"Aloo matar (1 cup)":240,"Gobi masala (1 cup)":200,"Gobi 65 (1 cup)":350,"Baby corn pepper fry (1 cup)":220,
"Mushroom pepper fry (1 cup)":220,"Mushroom masala (1 cup)":250,"Mushroom curry (1 cup)":220,
"Peas masala (1 cup)":230,"Green peas curry (1 cup)":240,"Beetroot poriyal (1 cup)":150,"Beetroot curry (1 cup)":170,
"Carrot poriyal (1 cup)":140,"Chow chow poriyal (1 cup)":130,"Chow chow kootu (1 cup)":180,
"Keerai/spinach poriyal (1 cup)":120,"Spinach curry (1 cup)":140,"Spinach dal (1 cup)":200,"Palak dal (1 cup)":200,
"Drumstick leaves poriyal (1 cup)":130,"Moringa/keerai kootu (1 cup)":180,"Pumpkin kootu (1 cup)":180,
"Snake gourd kootu (1 cup)":170,"Bottle gourd curry (1 cup)":150,"Ridge gourd curry (1 cup)":150,
"Snake gourd poriyal (1 cup)":130,"Ash gourd curry (1 cup)":130,"Raw banana fry (1 cup)":240,"Raw banana curry (1 cup)":200,
"Yam fry (1 cup)":280,"Yam curry (1 cup)":220,"Taro/cheppankizhangu fry (1 cup)":300,"Plantain fry (1 cup)":260,
"Paneer butter masala (1 cup)":350,"Palak paneer (1 cup)":300,"Paneer tikka (6 pieces)":300,"Paneer curry (1 cup)":300,
"Shahi paneer (1 cup)":400,"Matar paneer (1 cup)":330,"Kadai paneer (1 cup)":350,"Paneer bhurji (1 cup)":320,
"Tofu stir fry (1 cup)":200,"Soy chunks curry (1 cup)":260,
/* Non-veg */
"Boiled egg (1)":78,"Boiled eggs (2)":156,"Egg bhurji (2 eggs)":220,"Omelette (2 eggs)":220,"Masala omelette (2 eggs)":260,
"Egg curry (2 eggs)":280,"Egg roast (2 eggs)":300,"Egg masala (2 eggs)":290,"Chicken breast cooked (100 g)":165,
"Chicken curry (1 cup)":320,"Chicken masala (1 cup)":350,"Chicken chettinad (1 cup)":380,"Chicken pepper fry (1 cup)":350,
"Chicken sukka (1 cup)":360,"Chicken 65 (100 g)":250,"Chicken 65 (1 plate)":500,"Chicken tikka (100 g)":180,
"Chicken tikka (6 pieces)":280,"Tandoori chicken (1 leg)":250,"Tandoori chicken (half)":420,"Tandoori chicken (full)":800,
"Butter chicken (1 cup)":400,"Kadai chicken (1 cup)":380,"Chicken do pyaza (1 cup)":360,"Chicken saag (1 cup)":350,
"Chicken stew (1 cup)":280,"Chicken lollipop (4 pieces)":400,"Mutton curry (1 cup)":400,"Mutton masala (1 cup)":430,
"Mutton sukka (1 cup)":420,"Mutton pepper fry (1 cup)":430,"Mutton keema (1 cup)":400,"Mutton rogan josh (1 cup)":420,
"Fish curry (1 cup)":250,"Fish fry (1 piece)":220,"Fish fry (100 g)":230,"Fish tikka (100 g)":180,
"Grilled fish (100 g)":160,"Prawn curry (1 cup)":300,"Prawn fry (100 g)":250,"Prawn masala (1 cup)":320,
"Crab curry (1 cup)":250,"Chicken soup (1 bowl)":150,"Mutton soup (1 bowl)":180,"Sweet corn chicken soup (1 bowl)":180,
/* Salads, raita & lunch extras */
"Plain curd (100 g)":60,"Curd/plain yogurt (1 cup)":150,"Raita (1 cup)":100,"Boondi raita (1 cup)":180,
"Onion raita (1 cup)":90,"Cucumber raita (1 cup)":90,"Carrot raita (1 cup)":95,"Sprouts salad (1 cup)":120,
"Mixed vegetable salad (1 bowl)":100,"Cucumber salad (1 bowl)":50,"Kosambari (1 cup)":140,"Pachadi (1 cup)":120,
"Papad (1)":35,"Roasted papad (1)":30,"Appalam (1)":35,"Pickle (1 tbsp)":30,"Potato chips (30 g)":160,
"French fries (small)":230,"French fries (medium)":340,
/* Snacks & street food */
"Samosa (1)":260,"Samosa (2)":520,"Aloo samosa (1)":260,"Paneer samosa (1)":280,"Kachori (1)":220,"Aloo kachori (1)":240,
"Pakora/bajji (4 pieces)":250,"Onion pakora (4)":250,"Onion bajji (2)":220,"Banana bajji (2)":240,"Potato bajji (2)":230,
"Mirchi bajji (2)":220,"Bonda (2)":250,"Aloo bonda (2)":260,"Mysore bonda (3)":300,"Pani puri (6)":250,
"Sev puri (1 plate)":300,"Bhel puri (1 plate)":280,"Dahi puri (6)":350,"Masala puri (1 plate)":320,
"Vada pav (1)":290,"Pav bhaji (1 plate)":400,"Bread pakora (1)":220,"Corn chaat (1 cup)":180,"Sweet corn (1 cup)":150,
"Masala corn (1 cup)":190,"Roasted chana (30 g)":120,"Peanut chikki (1 piece)":150,"Sundal (1 cup)":220,
"Murukku (2 pieces)":180,"Mixture (30 g)":160,"Mixture (50 g)":270,"Banana chips (30 g)":160,"Nendran chips (30 g)":170,
/* Bread, breakfast cereals & drinks */
"Bread (2 slices)":140,"Brown bread (2 slices)":130,"Multigrain bread (2 slices)":150,"Peanut butter (1 tbsp)":95,
"Jam (1 tbsp)":50,"Oats cooked (1 cup)":160,"Oats with milk (1 bowl)":280,"Masala oats (1 bowl)":250,
"Cornflakes with milk (1 bowl)":250,"Muesli with milk (1 bowl)":320,"Granola with milk (1 bowl)":380,
"Milk (1 glass)":120,"Low-fat milk (1 glass)":90,"Buttermilk (1 glass)":80,"Salted buttermilk (1 glass)":70,
"Tea with milk (1 cup)":90,"Tea with milk + 2 tsp sugar (1 cup)":130,"Tea without sugar (1 cup)":20,
"Filter coffee (1 cup)":110,"Coffee with milk (1 cup)":90,"Coffee without sugar (1 cup)":15,"Cold coffee (1 glass)":220,
"Lassi sweet (1 glass)":220,"Lassi salted (1 glass)":100,"Mango lassi (1 glass)":250,"Fresh lime juice (1 glass)":80,
"Fresh lime soda sweet (1 glass)":130,"Tender coconut water (1 glass)":45,"Coconut water (1 coconut)":60,
/* Fruits */
"Banana (1 small)":90,"Banana (1 medium)":105,"Banana (1 large)":120,"Apple (1 medium)":95,"Orange (1)":62,
"Sweet lime/mosambi (1)":80,"Guava (1)":68,"Mango (1 medium)":135,"Papaya (1 cup)":55,"Watermelon (1 cup)":46,
"Muskmelon (1 cup)":55,"Pineapple (1 cup)":82,"Pomegranate (1 cup)":145,"Grapes (1 cup)":105,"Pear (1 medium)":100,
"Kiwi (1)":42,"Dates (3)":200,"Raisins (30 g)":90,
/* Nuts & sweets */
"Almonds (10)":70,"Cashews (10)":85,"Walnuts (5 halves)":65,"Peanuts (30 g)":170,"Mixed nuts (30 g)":180,
"Dry fruit mix (30 g)":170,"Gulab jamun (1)":150,"Gulab jamun (2)":300,"Jalebi (2)":220,"Rasgulla (2)":180,
"Kheer/payasa (1 cup)":250,"Payasam (1 cup)":250,"Semiya payasam (1 cup)":260,"Rice kheer (1 cup)":250,
"Laddu (1)":180,"Besan laddu (1)":180,"Motichoor laddu (1)":190,"Mysore pak (1 piece)":180,"Halwa (1/2 cup)":250,
"Carrot halwa (1/2 cup)":220,"Sooji halwa (1/2 cup)":230,"Ice cream (1 scoop)":140,"Kulfi (1)":180,
"Chocolate (20 g)":110,"Biscuit (1)":50,"Biscuits (4)":200
,"Plain rice + rasam (1 plate)":280,"Plain rice + sambar (1 plate)":325,"Plain rice + curd (1 plate)":300,"Plain rice + dal (1 plate)":350,
"Rice + spinach/keerai (1 plate)":330,"Rice + veg kurma (1 plate)":420,"Rice + mixed veg curry (1 plate)":380,"Rice + potato fry (1 plate)":450,
"Rice + cauliflower curry (1 plate)":390,"Rice + beans poriyal (1 plate)":360,"Rice + cabbage poriyal (1 plate)":350,"Rice + avial (1 plate)":380,
"Rice + kootu (1 plate)":370,"Rice + mor kuzhambu (1 plate)":350,"Rice + kara kuzhambu (1 plate)":380,"Rice + vatha kuzhambu (1 plate)":390,
"Rice + puli kuzhambu (1 plate)":380,"Rice + fish curry (1 plate)":460,"Rice + chicken curry (1 plate)":530,
"Rice + egg curry (1 plate)":480,"Rice + mutton curry (1 plate)":580,
"Veg pulao (1 cup)":300,"Veg pulao (1 plate)":450,"Paneer pulao (1 plate)":500,"Mushroom pulao (1 plate)":450,"Peas pulao (1 plate)":430,
"Jeera pulao (1 plate)":420,"Kashmiri pulao (1 plate)":500,"Corn pulao (1 plate)":440,"Methi pulao (1 plate)":430,
"Veg biryani (1 cup)":330,"Veg biryani (1 plate)":450,"Paneer biryani (1 plate)":550,"Mushroom biryani (1 plate)":500,
"Hyderabadi veg biryani (1 plate)":480,"Ambur veg biryani (1 plate)":470,"Donne veg biryani (1 plate)":500,
"Chicken biryani (1 cup)":430,"Chicken biryani (1 plate)":600,"Hyderabadi chicken biryani (1 plate)":650,
"Ambur chicken biryani (1 plate)":600,"Dindigul chicken biryani (1 plate)":620,"Donne chicken biryani (1 plate)":650,
"Thalassery chicken biryani (1 plate)":620,"Mutton biryani (1 plate)":650,"Egg biryani (1 plate)":550,"Fish biryani (1 plate)":600,
"Prawn biryani (1 plate)":620,"Kuska/plain biryani rice (1 plate)":430,"Biryani rice only (1 cup)":300,
"Veg fried rice (1 cup)":300,"Veg fried rice (1 plate)":450,"Paneer fried rice (1 plate)":520,"Mushroom fried rice (1 plate)":480,
"Chicken fried rice (1 plate)":550,"Egg fried rice (1 plate)":520,"Schezwan veg fried rice (1 plate)":500,"Schezwan chicken fried rice (1 plate)":600,
"Singapore veg rice (1 plate)":500,"Triple schezwan rice (1 plate)":700,
"Tomato rice (1 cup)":280,"Tomato rice (1 plate)":420,"Lemon rice (1 cup)":280,"Lemon rice (1 plate)":420,
"Tamarind rice/puliyodarai (1 cup)":300,"Tamarind rice/puliyodarai (1 plate)":450,"Coconut rice (1 cup)":330,"Coconut rice (1 plate)":480,
"Curd rice (1 cup)":250,"Curd rice (1 plate)":380,"Mango rice (1 cup)":300,"Mango rice (1 plate)":440,
"Mint rice (1 cup)":280,"Mint rice (1 plate)":420,"Coriander rice (1 cup)":280,"Coriander rice (1 plate)":420,
"Beetroot rice (1 plate)":430,"Capsicum rice (1 plate)":430,"Curry leaf rice (1 plate)":430,"Sesame rice (1 plate)":450,
"Vangi bath/brinjal rice (1 plate)":450,"Bisibele bath (1 plate)":450,"Sambar sadam (1 plate)":450,"Rasam sadam (1 plate)":400,
"Keerai sadam/spinach rice (1 plate)":430,"Kuzhambu sadam (1 plate)":450,
"Sambar (1 cup)":120,"Sambar (2 cups)":240,"Drumstick sambar (1 cup)":130,"Arachuvitta sambar (1 cup)":150,"Tiffin sambar (1 cup)":120,
"Onion sambar (1 cup)":130,"Brinjal sambar (1 cup)":140,"Keerai sambar (1 cup)":130,"Pumpkin sambar (1 cup)":130,
"Rasam (1 cup)":70,"Tomato rasam (1 cup)":65,"Pepper rasam (1 cup)":70,"Garlic rasam (1 cup)":75,"Mysore rasam (1 cup)":80,
"Jeera rasam (1 cup)":70,"Pineapple rasam (1 cup)":90,"Lemon rasam (1 cup)":65,"Paruppu rasam (1 cup)":90,
"Mor kuzhambu (1 cup)":150,"Vellarikka mor kuzhambu (1 cup)":140,"Paruppu urundai kuzhambu (1 cup)":230,
"Kara kuzhambu (1 cup)":180,"Vatha kuzhambu (1 cup)":190,"Puli kuzhambu (1 cup)":180,"Ennai kathirikai kuzhambu (1 cup)":230,
"Milagu kuzhambu (1 cup)":180,"Vendakkai kuzhambu (1 cup)":190,"Poosanikai kuzhambu (1 cup)":160,"Mochai kuzhambu (1 cup)":220,
"Kathirikai gothsu (1 cup)":160,"Gotsu (1 cup)":160,"Pitlai (1 cup)":190,"Theeyal (1 cup)":200,
"Vegetable kurma (1 cup)":250,"Vegetable kurma (1.5 cups)":375,"Mixed vegetable kurma (1 cup)":260,"White veg kurma (1 cup)":250,
"South Indian veg kurma (1 cup)":250,"Coconut veg kurma (1 cup)":280,"Navaratna kurma (1 cup)":330,"Paneer kurma (1 cup)":340,
"Potato kurma (1 cup)":250,"Chana kurma (1 cup)":280,"Mushroom kurma (1 cup)":270,
"Avial (1 cup)":180,"Avial (1.5 cups)":270,"Mixed vegetable kootu (1 cup)":190,"Chow chow kootu (1 cup)":180,
"Pumpkin kootu (1 cup)":180,"Snake gourd kootu (1 cup)":170,"Keerai kootu (1 cup)":180,"Sorakkai kootu (1 cup)":170,
"Paruppu usili (1 cup)":220,"Beans paruppu usili (1 cup)":230,"Cluster beans paruppu usili (1 cup)":230,
"Poriyal mixed vegetables (1 cup)":160,"Beans poriyal (1 cup)":150,"Carrot beans poriyal (1 cup)":160,"Cabbage poriyal (1 cup)":140,
"Cauliflower poriyal (1 cup)":150,"Beetroot poriyal (1 cup)":150,"Carrot poriyal (1 cup)":140,"Beans carrot coconut poriyal (1 cup)":180,
"Keerai/spinach poriyal (1 cup)":120,"Moringa leaves poriyal (1 cup)":130,"Pumpkin poriyal (1 cup)":130,"Snake gourd poriyal (1 cup)":130,
"Ridge gourd poriyal (1 cup)":130,"Chow chow poriyal (1 cup)":130,"Raw banana poriyal (1 cup)":220,"Yam poriyal (1 cup)":240,
"Potato fry (1 cup)":280,"Potato roast (1 cup)":260,"Aloo jeera (1 cup)":220,"Aloo gobi (1 cup)":220,"Aloo matar (1 cup)":240,
"Cauliflower curry (1 cup)":180,"Gobi masala (1 cup)":200,"Gobi peas curry (1 cup)":220,"Broccoli curry (1 cup)":160,
"Spinach curry (1 cup)":140,"Spinach dal (1 cup)":200,"Palak dal (1 cup)":200,"Keerai masiyal (1 cup)":130,
"Keerai kadaiyal (1 cup)":140,"Keerai molagootal (1 cup)":180,"Moringa leaves dal (1 cup)":210,
"Beetroot curry (1 cup)":170,"Carrot peas curry (1 cup)":190,"Mixed veg curry (1 cup)":180,"Cabbage curry (1 cup)":150,
"Drumstick curry (1 cup)":160,"Brinjal curry (1 cup)":180,"Okra curry (1 cup)":170,"Okra/bhindi fry (1 cup)":220,
"Raw banana curry (1 cup)":200,"Yam curry (1 cup)":220,"Bottle gourd curry (1 cup)":150,"Ridge gourd curry (1 cup)":150,
"Snake gourd curry (1 cup)":150,"Ash gourd curry (1 cup)":130,"Pumpkin curry (1 cup)":150,
"Plain curd (100 g)":60,"Curd (1/2 cup)":75,"Curd (1 cup)":150,"Raita (1 cup)":100,"Cucumber raita (1 cup)":90,
"Boondi raita (1 cup)":180,"Onion raita (1 cup)":90,"Carrot raita (1 cup)":95,
"Appalam (1)":35,"Papad (1)":35,"Pickle (1 tbsp)":30,"Potato chips (30 g)":160
};
const foodInput=$("food"),calInput=$("cal");
const qtyInput=$("qty"),gramsInput=$("grams"),qtyHint=$("qtyHint"),gramLabel=$("gramLabel"),qtyLabel=$("qtyLabel"),proInput=$("pro"),carbInput=$("carb"),fatInput=$("fat");
function isPieceFood(name){return /(idli|dosa|uttapam|vada|paniyaram|appam|adai|poori|chapati|phulka|paratha|parotta|omelette|egg|samosa|kachori|bonda|bajji|puri|laddu|jamun|jalebi|rasgulla|kulfi|biscuit|bread|banana|apple|orange|guava|mango|kiwi|date|papad|appalam|piece|pieces|scoop|leg|half|full)/i.test(name)}
function servingWeight(name){if(/biryani|pulao|fried rice|rice|sadam|bath|poha|upma|pongal/i.test(name))return 200;if(/sambar|rasam|kuzhambu|kurma|curry|dal|kootu|poriyal|avial|raita|masala|gravy|sukka|fry|roast|stir fry/i.test(name))return 150;if(/tea|coffee|milk|buttermilk|lassi|juice|water|soup/i.test(name))return 250;if(/sweet|halwa|payasam|kheer|mixture|chips|nuts|chikki/i.test(name))return 50;return 150}
function macroProfile(name){const n=name.toLowerCase();if(/chicken|mutton|fish|prawn|crab|meat/.test(n))return[.42,.08,.50];if(/egg/.test(n))return[.26,.04,.70];if(/paneer|cheese/.test(n))return[.20,.10,.70];if(/milk|curd|yogurt|lassi|buttermilk/.test(n))return[.22,.28,.50];if(/dal|rajma|chana|sundal|bean|peas|lentil|kootu/.test(n))return[.22,.58,.20];if(/banana|apple|orange|guava|mango|papaya|watermelon|muskmelon|pineapple|pomegranate|grape|pear|kiwi|date|raisin/.test(n))return[.05,.90,.05];if(/nuts|almond|cashew|walnut|peanut|chikki/.test(n))return[.12,.18,.70];if(/sweet|halwa|payasam|kheer|gulab|jalebi|rasgulla|laddu|mysore|ice cream|kulfi|chocolate/.test(n))return[.05,.55,.40];if(/samosa|kachori|pakora|bajji|bonda|pani puri|pav bhaji|murukku|mixture|chips|fries|vada/.test(n))return[.07,.48,.45];if(/idli/.test(n))return[.20,.78,.02];if(/dosa|uttapam|appam|adai|paniyaram|poori|chapati|phulka|paratha|parotta|bread|poha|upma|pongal/.test(n))return[.10,.72,.18];if(/rice|biryani|pulao|fried rice|sadam|bath/.test(n))return[.08,.74,.18];if(/spinach|keerai|cauliflower|cabbage|carrot|beetroot|broccoli|gourd|pumpkin|okra|brinjal|potato|yam|vegetable|poriyal|avial|salad/.test(n))return[.10,.62,.28];return[.10,.65,.25]}
function macrosForCalories(name,kcal){const [p,c,f]=macroProfile(name);return{protein:+(kcal*p/4).toFixed(1),carbs:+(kcal*c/4).toFixed(1),fat:+(kcal*f/9).toFixed(1)}}
function nutritionForFood(){const name=foodInput.value,kcalBase=Number(indianFoods[name]||0);if(!kcalBase)return{calories:0,protein:0,carbs:0,fat:0};if(isPieceFood(name)){const match=name.match(/\((\d+(?:\.\d+)?)\s*(?:pieces?|items?|scoops?|eggs?)?/i),baseQty=match?Number(match[1]):1,qty=Math.max(1,Number(qtyInput.value)||1),kcal=kcalBase*(qty/baseQty);return{calories:Math.round(kcal),...macrosForCalories(name,kcal)}}const grams=Math.max(1,Number(gramsInput.value)||100),kcal=kcalBase*(grams/servingWeight(name));return{calories:Math.round(kcal),...macrosForCalories(name,kcal)}}
function updateQuantityMode(){const piece=isPieceFood(foodInput.value);qtyLabel.classList.toggle("hidden",!piece);gramLabel.classList.toggle("hidden",piece);qtyHint.textContent=piece?"pieces":"";if(!piece&&!gramsInput.value)gramsInput.value=100;updateNutritionFields()}
function updateNutritionFields(){const n=nutritionForFood();calInput.value=n.calories||"";proInput.value=n.protein||"";carbInput.value=n.carbs||"";fatInput.value=n.fat||""}
function applyFoodPreset(){updateQuantityMode()}
const foodList=$("indianFoodList");if(foodList)foodList.innerHTML=Object.entries(indianFoods).map(([name,kcal])=>`<option value="${name}">${kcal} kcal</option>`).join("");
foodInput?.addEventListener("change",applyFoodPreset);
foodInput?.addEventListener("input",()=>{if(indianFoods[foodInput.value]!=null)updateQuantityMode()});
qtyInput?.addEventListener("input",updateNutritionFields);
gramsInput?.addEventListener("input",updateNutritionFields);

function key(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate()).toISOString().slice(0,10)}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function icon(t){return({Breakfast:"☀️",Lunch:"🍛",Snack:"🍎",Dinner:"🌙",Other:"🍽️"})[t]||"🍽️"}
function status(id,msg,bad=false){$(id).textContent=msg;$(id).classList.toggle("error",bad)}
function show(v){["authView","roomView","appView"].forEach(x=>$(x).classList.toggle("hidden",x!==v))}
function dateText(k){return k===key(new Date())?"Today":new Date(k+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
function totals(uid){return meals.filter(m=>m.eaten_on===day&&(!uid||m.user_id===uid)).reduce((a,m)=>a+(Number(m.calories)||0),0)}\nfunction macroTotals(uid){return meals.filter(m=>m.eaten_on===day&&(!uid||m.user_id===uid)).reduce((a,m)=>({protein:a.protein+Number(m.protein||0),carbs:a.carbs+Number(m.carbs||0),fat:a.fat+Number(m.fat||0)}),{protein:0,carbs:0,fat:0})}
function render(){
 $("date").textContent=dateText(day);const ps=[...people].sort((a,b)=>String(a.id).localeCompare(String(b.id)));renderPerson("p1",ps[0]);renderPerson("p2",ps[1]);
 const today=meals.filter(m=>m.eaten_on===day).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 $("list").innerHTML=today.length?today.map(m=>'<article class="meal"><div class="ico">'+icon(m.meal_type)+'</div><div><b>'+safe(m.food)+'</b><span>'+safe(m.profiles?.name||"Member")+' · '+safe(m.meal_type)+'</span></div><div class="kcal"><b>'+fmt(m.calories)+'</b><span>kcal</span></div><button class="del" data-id="'+m.id+'">×</button></article>').join(""):'<div class="empty">No meals logged for this day yet.</div>';
 $("list").querySelectorAll(".del").forEach(b=>b.onclick=()=>deleteMeal(b.dataset.id));
 const total=today.reduce((a,m)=>a+Number(m.calories||0),0);$("mc").textContent=today.length;$("tc").textContent=fmt(total);const dm=macroTotals();$("tp").textContent=dm.protein.toFixed(1)+"g";$("tcb").textContent=dm.carbs.toFixed(1)+"g";$("tf").textContent=dm.fat.toFixed(1)+"g";$("sum").textContent=today.length?fmt(total)+" kcal logged":"Nothing logged yet";$("sub").textContent=ps.length>1?ps[0].name+": "+fmt(totals(ps[0].id))+" · "+ps[1].name+": "+fmt(totals(ps[1].id)):"Invite your friend to start tracking together.";if(room)$("roomMeta").textContent="Room "+room.invite_code+" · "+people.length+"/2 members";
}
function renderPerson(pre,p){
 if(!p){$(pre+"n").textContent="Waiting…";$(pre+"role").textContent="Invite your friend";$(pre+"t").textContent="—";$(pre+"c").textContent="0";$(pre+"rm").textContent="—";$(pre+"p").textContent="";$(pre+"b").style.width="0";return}
 const t=totals(p.id),pct=(Number(p.calorie_target)||2000)?t/(Number(p.calorie_target)||2000)*100:0;$(pre+"n").textContent=p.name;$(pre+"role").textContent=p.id===user?.id?"You":"Friend";$(pre+"t").textContent=fmt(p.calorie_target)+" kcal";$(pre+"c").textContent=fmt(t);$(pre+"rm").textContent=fmt(Math.max(0,p.calorie_target-t));$(pre+"p").textContent=Math.round(pct)+"% of target";$(pre+"b").style.width=Math.min(100,pct)+"%";$(pre+"r").style.setProperty("--p",Math.min(100,pct)+"%");
}
async function loadRoom(id){
 roomId=id;localStorage.setItem("calorieDuoRoom",id);
 const {data:r,error:re}=await supabase.from("rooms").select("*").eq("id",id).single();if(re)throw re;room=r;
 await refresh();subscribe();show("appView");
}
async function refresh(){
 const [{data:p,error:pe},{data:m,error:me}]=await Promise.all([
  supabase.from("profiles").select("id,name,calorie_target,room_id").eq("room_id",roomId),
  supabase.from("meals").select("id,user_id,meal_type,food,calories,protein,carbs,fat,eaten_on,created_at").eq("room_id",roomId).eq("eaten_on",day)
 ]);
 if(pe)throw pe;if(me)throw me;
 people=p||[];meals=m||[];
 if(meals.length){
   const ids=[...new Set(meals.map(x=>x.user_id))];
   const {data:memberProfiles,error:profileError}=await supabase.from("profiles").select("id,name").in("id",ids);
   if(profileError)throw profileError;
   const names=new Map((memberProfiles||[]).map(x=>[x.id,x.name]));
   meals=meals.map(m=>({...m,profiles:{name:names.get(m.user_id)||"Member"}}));
 }
 render();
}
function subscribe(){
 peopleChannel?.unsubscribe();mealChannel?.unsubscribe();
 peopleChannel=supabase.channel("room-members-"+roomId).on("postgres_changes",{event:"*",schema:"public",table:"profiles",filter:"room_id=eq."+roomId},refresh).subscribe();
 mealChannel=supabase.channel("room-meals-"+roomId).on("postgres_changes",{event:"*",schema:"public",table:"meals",filter:"room_id=eq."+roomId},refresh).subscribe();
}
async function createRoom(){
 const {data,error}=await supabase.rpc("create_room",{p_name:$("createName").value.trim(),p_target:Number($("createTarget").value)||2000});if(error)throw error;await loadRoom(data);
}
async function joinRoom(){
 const {data,error}=await supabase.rpc("join_room",{p_code:$("joinCode").value.trim(),p_name:$("joinName").value.trim(),p_target:Number($("joinTarget").value)||2000});if(error)throw error;await loadRoom(data);
}
async function deleteMeal(id){const {error}=await supabase.from("meals").delete().eq("id",id).eq("user_id",user.id);if(error)alert(error.message)}
async function addMeal(e){
 e.preventDefault();const food=$("food").value.trim(),cal=Number($("cal").value);if(!food||!Number.isFinite(cal)||cal<0)return;
 const {data:p}=await supabase.from("profiles").select("name").eq("id",user.id).single();
 const {error}=await supabase.from("meals").insert({room_id:roomId,user_id:user.id,meal_type:$("type").value,food,calories:cal,protein:Number($("pro").value)||0,carbs:Number($("carb").value)||0,fat:Number($("fat").value)||0,eaten_on:day});
 if(error)status("status",error.message,true);else{e.target.reset();status("status","Meal added.")}
}
async function clearMine(){
 const ids=meals.filter(m=>m.eaten_on===day&&m.user_id===user.id).map(m=>m.id);if(!ids.length)return;if(confirm("Delete your meals for "+dateText(day)+"?"))await supabase.from("meals").delete().in("id",ids).eq("user_id",user.id);
}
async function copyCode(){await navigator.clipboard.writeText(room.invite_code);status("roomMeta","Invite code "+room.invite_code+" copied.")}
async function loadUser(){
 const {data:p}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
 if(p?.room_id){try{await loadRoom(p.room_id);return}catch{}}
 const saved=localStorage.getItem("calorieDuoRoom");if(saved){try{await loadRoom(saved);return}catch{localStorage.removeItem("calorieDuoRoom")}}
 $("createName").value=p?.name||"";$("joinName").value=p?.name||"";show("roomView");
}
document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>{authMode=b.dataset.authTab;document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===b));$("authNameLabel").classList.toggle("hidden",authMode!=="signup");$("authSubmit").textContent=authMode==="signup"?"Create account":"Sign in"});
$("authForm").onsubmit=async e=>{e.preventDefault();const email=$("authEmail").value.trim(),password=$("authPassword").value;status("authStatus","Signing in…");const r=authMode==="signup"?await supabase.auth.signUp({email,password,options:{data:{name:$("authName").value.trim()||"User"},emailRedirectTo:location.origin}}):await supabase.auth.signInWithPassword({email,password});if(r.error){status("authStatus",r.error.message,true);return}if(r.data.session){user=r.data.user;await loadUser();return}if(authMode==="signup"){status("authStatus","Account created. Check your email and click the confirmation link, then sign in.")}else{status("authStatus","No active session. Please confirm your email first, then sign in.",true)}};
$("createRoomForm").onsubmit=async e=>{e.preventDefault();try{await createRoom()}catch(x){status("roomStatus",x.message,true)}};
$("joinRoomForm").onsubmit=async e=>{e.preventDefault();try{await joinRoom()}catch(x){status("roomStatus",x.message,true)}};
async function logout(){peopleChannel?.unsubscribe();mealChannel?.unsubscribe();localStorage.removeItem("calorieDuoRoom");await supabase.auth.signOut();show("authView")}
$("signOut").onclick=$("signOutFromRoom").onclick=logout;
$("mealForm").onsubmit=addMeal;$("clear").onclick=clearMine;
$("prev").onclick=async()=>{const d=new Date(day+"T00:00:00");d.setDate(d.getDate()-1);day=key(d);await refresh()};$("next").onclick=async()=>{const d=new Date(day+"T00:00:00");d.setDate(d.getDate()+1);day=key(d);await refresh()};$("today").onclick=async()=>{day=key(new Date());await refresh()};
$("copyCode").onclick=$("copyCode2").onclick=copyCode;
$("settings").onclick=async()=>{const {data:p}=await supabase.from("profiles").select("*").eq("id",user.id).single();$("settingsName").value=p.name;$("settingsTarget").value=p.calorie_target;$("settingsDialog").showModal()};
$("closeSettings").onclick=()=>$("settingsDialog").close();
$("settingsForm").onsubmit=async e=>{e.preventDefault();const {error}=await supabase.from("profiles").update({name:$("settingsName").value.trim()||"User",calorie_target:Number($("settingsTarget").value)||2000}).eq("id",user.id);if(error)status("settingsStatus",error.message,true);else $("settingsDialog").close()};
supabase.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;if(user)loadUser();else show("authView")});
const initial=await supabase.auth.getSession();if(initial.data.session){user=initial.data.session.user;await loadUser()}else show("authView");