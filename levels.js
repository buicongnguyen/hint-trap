(() => {
  const ASSET_ROOT = "assets/images/items/";

  function itemImage(source, alt, extra = {}) {
    const hasExtension = /\.[a-z0-9]+$/i.test(source);
    const isPath = source.includes("/");
    const image = isPath ? source : `${ASSET_ROOT}${source}${hasExtension ? "" : ".svg"}`;

    return { image, imageAlt: alt, ...extra };
  }

  function card(id, icon, text, x, y, w, h, extra = {}) {
    return { id, icon, text, x, y, w, h, shape: "card", tone: "slate", interactive: true, ...extra };
  }

  function pill(id, icon, text, x, y, w, h, extra = {}) {
    return { id, icon, text, x, y, w, h, shape: "pill", tone: "slate", interactive: true, ...extra };
  }

  function bubble(id, icon, text, x, y, w, h, extra = {}) {
    return { id, icon, text, x, y, w, h, shape: "circle", tone: "slate", interactive: true, ...extra };
  }

  function choice(id, text, x, y, w = 16, h = 14, extra = {}) {
    return { id, icon: "", text, x, y, w, h, shape: "choice", tone: "slate", interactive: true, ...extra };
  }

  function zone(id, text, x, y, w, h, extra = {}) {
    return { id, icon: "", text, x, y, w, h, shape: "zone", tone: "slate", interactive: false, ...extra };
  }

  function textTag(id, text, x, y, w, h, extra = {}) {
    return { id, icon: "", text, x, y, w, h, shape: "text", tone: "slate", interactive: true, ...extra };
  }

  function cover(id, icon, text, x, y, w, h, extra = {}) {
    return {
      id,
      icon,
      text,
      x,
      y,
      w,
      h,
      shape: "cover",
      tone: "slate",
      interactive: false,
      draggable: true,
      ...extra
    };
  }

  function tapWord(word, label = word) {
    return `<button type="button" class="prompt-word" data-tap-word="${word}">${label}</button>`;
  }

  function dragWord(word, label = word) {
    return `<button type="button" class="prompt-word" data-drag-word="${word}">${label}</button>`;
  }

  window.HINT_TRAP_STAGES = [
    {
      id: "biggest-animal",
      title: "Scale Lie",
      subtitle: "The clue is honest. Your assumptions are the problem.",
      tag: "Screen Trick",
      mechanic: "On-screen size",
      theme: "screen",
      promptHtml: "Tap the biggest animal.",
      hint: "Ignore the real world. Only the size on this page matters.",
      solution: { kind: "tap", target: "mouse" },
      success: "Right. The mouse is biggest on this screen.",
      wrong: "This stage measures size on the page, not in nature.",
      items: [
        card("elephant", "🐘", "Elephant", 8, 40, 26, 18, itemImage("elephant", "Elephant", { tone: "gold" })),
        card("lion", "🦁", "Lion", 18, 72, 18, 14, itemImage("lion", "Lion", { tone: "coral" })),
        card("mouse", "🐭", "Mouse", 66, 18, 22, 24, itemImage("mouse", "Mouse", { tone: "violet" }))
      ]
    },
    {
      id: "highest-belt",
      title: "Above The Waist",
      subtitle: "Sometimes highest means highest on the board.",
      tag: "Screen Trick",
      mechanic: "Screen position",
      theme: "screen",
      promptHtml: "Tap the highest belt.",
      hint: "Read highest as top-most, not strongest.",
      solution: { kind: "tap", target: "white-belt" },
      success: "Exactly. The highest belt is the one sitting highest.",
      wrong: "This stage is about position, not martial arts rank.",
      items: [
        pill("white-belt", "🥋", "White Belt", 12, 14, 66, 10, { tone: "slate" }),
        pill("black-belt", "🥋", "Black Belt", 18, 42, 58, 10, { tone: "ink" }),
        pill("green-belt", "🥋", "Green Belt", 26, 70, 52, 10, { tone: "lime" })
      ]
    },
    {
      id: "any-number",
      title: "Outside The Board",
      subtitle: "The correct answer is not always inside the puzzle frame.",
      tag: "Header Trick",
      mechanic: "Meta click",
      theme: "word",
      promptHtml: "Tap any number.",
      hint: "The board only gives you number words. The header still has real digits.",
      solution: { kind: "metaTap", target: "stage-chip" },
      success: "Yes. The stage chip counts as a number on the page.",
      wrong: "Look beyond the board. The page itself is part of the puzzle.",
      items: [
        textTag("one-word", "One", 16, 26, 18, 14, { tone: "cyan" }),
        textTag("two-word", "Two", 40, 52, 18, 14, { tone: "violet" }),
        textTag("three-word", "Three", 68, 24, 18, 14, { tone: "coral" })
      ]
    },
    {
      id: "press-key",
      title: "Prompt Theft",
      subtitle: "The right object is hiding inside the clue itself.",
      tag: "Prompt Word",
      mechanic: "Tap the word",
      theme: "word",
      promptHtml: `Press ${tapWord("key")}.`,
      hint: "The clue gives you the correct key already.",
      solution: { kind: "promptTap", word: "key" },
      success: "Exactly. The word in the sentence was the real key.",
      wrong: "This time the answer lives inside the prompt.",
      items: [
        card("metal-key", "🗝️", "Metal Key", 12, 34, 22, 18, itemImage("metal-key", "Metal key", { tone: "gold" })),
        card("keyboard", "⌨️", "Keyboard", 40, 58, 28, 18, itemImage("keyboard", "Keyboard", { tone: "cyan" })),
        card("piano-key", "🎹", "Piano", 70, 28, 18, 18, itemImage("piano-key", "Piano keys", { tone: "slate" }))
      ]
    },
    {
      id: "left-fruit",
      title: "Map Reading",
      subtitle: "Left and right are easier when you stop overthinking them.",
      tag: "Screen Trick",
      mechanic: "Screen position",
      theme: "screen",
      promptHtml: "Tap the left-most fruit.",
      hint: "Find the fruit furthest to the left edge.",
      solution: { kind: "tap", target: "pear" },
      success: "Correct. The pear sits furthest left.",
      wrong: "Do not compare flavor. Just compare position.",
      items: [
        card("pear", "🍐", "Pear", 10, 40, 18, 20, itemImage("pear", "Pear", { tone: "lime" })),
        card("apple", "🍎", "Apple", 42, 52, 18, 18, itemImage("apple", "Apple", { tone: "coral" })),
        card("orange-fruit", "🍊", "Orange", 72, 28, 18, 18, itemImage("orange", "Orange", { tone: "gold" }))
      ]
    },
    {
      id: "smallest-planet",
      title: "Space Optics",
      subtitle: "Real facts can be the worst hint in a screen puzzle.",
      tag: "Screen Trick",
      mechanic: "On-screen size",
      theme: "screen",
      promptHtml: "Tap the smallest planet.",
      hint: "Not the smallest in space. The smallest here.",
      solution: { kind: "tap", target: "jupiter" },
      success: "Right. Jupiter is tiny on the page, which is all that matters.",
      wrong: "The board is the only universe that matters right now.",
      items: [
        bubble("pluto", "🪐", "Pluto", 10, 22, 24, 24, { tone: "violet" }),
        bubble("mars", "🪐", "Mars", 42, 48, 18, 18, { tone: "coral" }),
        bubble("jupiter", "🪐", "Jupiter", 74, 26, 12, 12, { tone: "gold" })
      ]
    },
    {
      id: "sun-to-cactus",
      title: "Borrow The Weather",
      subtitle: "When the prompt sounds like an action, you probably need to move something.",
      tag: "Drag Object",
      mechanic: "Drag item",
      theme: "hidden",
      promptHtml: "Give the cactus some sunlight.",
      hint: "Move the sun. The clue is an instruction, not a trivia question.",
      solution: { kind: "dragItem", item: "sun", target: "cactus" },
      success: "Perfect. A little sunlight solves a lot.",
      wrong: "Try moving the weather instead of tapping the plant.",
      items: [
        bubble("sun", "☀️", "Sun", 10, 14, 16, 16, {
          ...itemImage("sun", "Sun"),
          tone: "gold",
          draggable: true,
          interactive: false
        }),
        card("cactus", "🌵", "Cactus", 56, 48, 20, 24, {
          ...itemImage("cactus", "Cactus"),
          tone: "lime",
          acceptItem: "sun"
        }),
        cover("cloud", "☁️", "Cloud", 28, 16, 22, 14, {
          ...itemImage("cloud", "Cloud"),
          tone: "slate",
          interactive: false
        })
      ]
    },
    {
      id: "plane-word",
      title: "Read The Cargo",
      subtitle: "Sometimes the thing you move is a word, not the picture.",
      tag: "Prompt Drag",
      mechanic: "Drag from the clue",
      theme: "word",
      promptHtml: `Put the ${dragWord("plane")} in the circle.`,
      hint: "The word can leave the sentence.",
      solution: { kind: "dragPromptWord", word: "plane", target: "target-circle" },
      success: "Exactly. The prompt supplied the plane.",
      wrong: "The prompt word is draggable here.",
      items: [
        zone("target-circle", "Drop Here", 62, 34, 22, 22, {
          shape: "circle",
          tone: "cyan",
          acceptWord: "plane"
        }),
        card("toy-plane", "✈️", "Toy Plane", 14, 54, 20, 18, { tone: "slate" }),
        textTag("red-ring", "Circle", 68, 62, 12, 10, { tone: "slate", interactive: false })
      ]
    },
    {
      id: "animal-at-top",
      title: "Top Shelf",
      subtitle: "The clue means exactly what the layout shows.",
      tag: "Screen Trick",
      mechanic: "Screen position",
      theme: "screen",
      promptHtml: "Tap the animal at the top.",
      hint: "Pick the animal nearest the top edge.",
      solution: { kind: "tap", target: "rooster" },
      success: "Right. The rooster is physically at the top.",
      wrong: "Top means top of the screen here.",
      items: [
        card("rooster", "🐓", "Rooster", 58, 12, 18, 16, { tone: "coral" }),
        card("pig", "🐖", "Pig", 18, 46, 18, 18, { tone: "violet" }),
        card("cow", "🐄", "Cow", 54, 68, 22, 18, { tone: "slate" })
      ]
    },
    {
      id: "find-phone",
      title: "Soft Cover",
      subtitle: "The answer is there already. You just need to uncover it.",
      tag: "Hidden Object",
      mechanic: "Reveal and tap",
      theme: "hidden",
      promptHtml: "Find the phone.",
      hint: "Move the pillow first.",
      solution: { kind: "revealTap", target: "phone" },
      success: "There it is. Soft things make good hiding spots.",
      wrong: "Something is hiding the phone.",
      items: [
        card("bed", "🛏️", "Bed", 12, 24, 72, 44, {
          ...itemImage("bed", "Bed", { imageSize: "min(46%, 160px)" }),
          tone: "slate",
          interactive: false
        }),
        cover("pillow", "🧸", "Pillow", 28, 34, 30, 18, {
          ...itemImage("pillow", "Pillow"),
          tone: "cyan",
          revealThreshold: 18,
          hideAfterReveal: true
        }),
        pill("phone", "📱", "Phone", 34, 44, 14, 16, {
          ...itemImage("phone", "Phone"),
          tone: "ink",
          hiddenUntilReveal: true
        })
      ]
    },
    {
      id: "count-wheels",
      title: "Count Everything",
      subtitle: "The clue does not say count the vehicles. It says count the wheels.",
      tag: "Count Trick",
      mechanic: "Count the page",
      theme: "count",
      promptHtml: "How many wheels are here?",
      hint: "Count the objects and the word in the prompt.",
      solution: { kind: "tap", target: "seven" },
      success: "Yes. Six real wheels plus the word wheels makes seven.",
      wrong: "The page itself can add to the count.",
      items: [
        card("bike", "🚲", "2", 12, 20, 20, 18, { tone: "cyan" }),
        card("car", "🚗", "4", 56, 18, 24, 18, { tone: "coral" }),
        choice("six", "6", 18, 70, 16, 14, { tone: "slate" }),
        choice("seven", "7", 42, 70, 16, 14, { tone: "gold" }),
        choice("eight", "8", 66, 70, 16, 14, { tone: "slate" })
      ]
    },
    {
      id: "tap-f",
      title: "Letter Theft",
      subtitle: "If you cannot find the answer in the scene, check the sentence again.",
      tag: "Prompt Word",
      mechanic: "Tap the word",
      theme: "word",
      promptHtml: `Tap the letter ${tapWord("F", "F")}.`,
      hint: "There is no F in the board. It is only in the clue.",
      solution: { kind: "promptTap", word: "F" },
      success: "Correct. The prompt hid the only F.",
      wrong: "The board is bait. The letter lives in the clue.",
      items: [
        textTag("e1", "E", 14, 18, 12, 12, { tone: "slate" }),
        textTag("e2", "E", 34, 32, 12, 12, { tone: "slate" }),
        textTag("e3", "E", 56, 18, 12, 12, { tone: "slate" }),
        textTag("e4", "E", 74, 38, 12, 12, { tone: "slate" }),
        textTag("e5", "E", 44, 64, 12, 12, { tone: "slate" })
      ]
    },
    {
      id: "find-triangles",
      title: "Shape Hunt",
      subtitle: "Multi-pick stages care about all the valid answers, not the prettiest one.",
      tag: "Multi Pick",
      mechanic: "Tap all valid items",
      theme: "count",
      promptHtml: "Find 3 triangles.",
      hint: "There are exactly three triangle-shaped things to tap.",
      solution: { kind: "multi", targets: ["warning-sign", "pizza-slice", "mountain-peak"] },
      success: "Nice. All three triangles are now marked.",
      wrong: "That shape is not one of the three triangles.",
      items: [
        card("warning-sign", "⚠️", "Sign", 16, 18, 16, 16, { tone: "gold" }),
        card("pizza-slice", "🍕", "Slice", 58, 22, 18, 18, { tone: "coral" }),
        card("mountain-peak", "⛰️", "Peak", 34, 54, 22, 18, { tone: "cyan" }),
        bubble("ball", "⚽", "Ball", 74, 62, 14, 14, { tone: "slate" }),
        card("window", "🪟", "Window", 8, 62, 18, 18, { tone: "slate" })
      ]
    },
    {
      id: "curtain-singer",
      title: "Backstage",
      subtitle: "Reveal first. Choose second.",
      tag: "Hidden Object",
      mechanic: "Reveal and tap",
      theme: "hidden",
      promptHtml: "Open the curtain and tap the singer.",
      hint: "Drag the curtain away from the stage.",
      solution: { kind: "revealTap", target: "singer" },
      success: "Exactly. The singer was behind the curtain.",
      wrong: "The curtain needs to move first.",
      items: [
        card("stage-floor", "🎭", "Stage", 14, 18, 72, 56, {
          tone: "violet",
          interactive: false
        }),
        cover("curtain", "🟥", "Curtain", 18, 14, 58, 44, {
          tone: "coral",
          revealThreshold: 16,
          hideAfterReveal: true
        }),
        card("singer", "🎤", "Singer", 44, 32, 16, 24, {
          tone: "gold",
          hiddenUntilReveal: true
        })
      ]
    },
    {
      id: "tallest-animal",
      title: "Height Cheat",
      subtitle: "Tall is not the same as big.",
      tag: "Screen Trick",
      mechanic: "On-screen height",
      theme: "screen",
      promptHtml: "Tap the tallest animal.",
      hint: "Choose the one that stretches highest on the page.",
      solution: { kind: "tap", target: "snake" },
      success: "Correct. The snake is tallest on the board.",
      wrong: "Compare height on the screen, not real animals.",
      items: [
        card("giraffe", "🦒", "Giraffe", 12, 40, 24, 18, { tone: "gold" }),
        pill("snake", "🐍", "Snake", 58, 14, 16, 34, { tone: "lime" }),
        card("dog", "🐕", "Dog", 36, 68, 18, 16, { tone: "slate" })
      ]
    },
    {
      id: "green-circle",
      title: "Color Smuggling",
      subtitle: "Words can become puzzle pieces when the clue lets them.",
      tag: "Prompt Drag",
      mechanic: "Drag from the clue",
      theme: "word",
      promptHtml: `Put ${dragWord("green")} in the empty circle.`,
      hint: "The word itself is the missing color.",
      solution: { kind: "dragPromptWord", word: "green", target: "empty-circle" },
      success: "Exactly. The empty circle wanted the word green.",
      wrong: "The missing piece is inside the sentence.",
      items: [
        bubble("blue-circle", "", "Blue", 16, 24, 18, 18, { tone: "cyan" }),
        bubble("empty-circle", "", "", 42, 48, 20, 20, {
          tone: "slate",
          acceptWord: "green"
        }),
        bubble("red-circle", "", "Red", 70, 22, 18, 18, { tone: "coral" })
      ]
    },
    {
      id: "count-clovers",
      title: "Botany Trap",
      subtitle: "Read the leaf count carefully before you start tapping.",
      tag: "Count Trick",
      mechanic: "Count the exact thing",
      theme: "count",
      promptHtml: "How many four-leaf clovers are there?",
      hint: "Those are shamrocks, not four-leaf clovers.",
      solution: { kind: "tap", target: "zero" },
      success: "Right. None of them have four leaves.",
      wrong: "These plants are not the exact thing the clue asks for.",
      items: [
        card("shamrock-a", "☘️", "", 16, 24, 16, 18, { tone: "lime", interactive: false }),
        card("shamrock-b", "☘️", "", 42, 40, 16, 18, { tone: "lime", interactive: false }),
        card("shamrock-c", "☘️", "", 68, 22, 16, 18, { tone: "lime", interactive: false }),
        choice("zero", "0", 18, 70, 16, 14, { tone: "gold" }),
        choice("one", "1", 42, 70, 16, 14, { tone: "slate" }),
        choice("two", "2", 66, 70, 16, 14, { tone: "slate" })
      ]
    },
    {
      id: "bottom-to-top",
      title: "Vertical Reading",
      subtitle: "Ignore meaning. Follow the layout order.",
      tag: "Sequence",
      mechanic: "Tap in order",
      theme: "count",
      promptHtml: "Tap the words from bottom to top.",
      hint: "Follow their vertical positions on the board.",
      solution: { kind: "sequence", order: ["hill", "kite", "cloud", "rocket"] },
      success: "Perfect. You climbed the page from the bottom up.",
      wrong: "Wrong order. Start again from the lowest word.",
      items: [
        textTag("rocket", "Rocket", 64, 10, 18, 14, { tone: "coral" }),
        textTag("cloud", "Cloud", 18, 28, 18, 14, { tone: "cyan" }),
        textTag("kite", "Kite", 58, 50, 18, 14, { tone: "violet" }),
        textTag("hill", "Hill", 24, 72, 18, 14, { tone: "lime" })
      ]
    },
    {
      id: "grow-cat",
      title: "Hold Still",
      subtitle: "Some stages want pressure and patience instead of a quick tap.",
      tag: "Gesture",
      mechanic: "Click and hold",
      theme: "hold",
      promptHtml: "Make the cat big enough to scare the dogs.",
      hint: "Press and hold the cat until it grows.",
      solution: { kind: "hold", target: "cat", duration: 1400, scale: 1.8 },
      success: "There you go. A large cat is suddenly a problem.",
      wrong: "This stage wants you to hold, not tap.",
      items: [
        card("dog-a", "🐕", "Dog", 10, 28, 18, 16, { tone: "slate", interactive: false }),
        card("cat", "🐈", "Cat", 40, 40, 20, 20, { tone: "gold" }),
        card("dog-b", "🐕", "Dog", 72, 32, 18, 16, { tone: "slate", interactive: false })
      ]
    },
    {
      id: "law-book",
      title: "Legal Transfer",
      subtitle: "The right label can be moved onto the right object.",
      tag: "Prompt Drag",
      mechanic: "Drag from the clue",
      theme: "word",
      promptHtml: `Put ${dragWord("law")} on the law book.`,
      hint: "The blue book needs the word from the sentence.",
      solution: { kind: "dragPromptWord", word: "law", target: "blue-book" },
      success: "Exactly. The clue supplied the law book label.",
      wrong: "Drag the word, not the book.",
      items: [
        card("red-book", "📕", "Book", 14, 30, 18, 20, { tone: "coral" }),
        card("blue-book", "📘", "Book", 42, 44, 18, 20, {
          tone: "cyan",
          acceptWord: "law"
        }),
        card("gold-book", "📙", "Book", 70, 28, 18, 20, { tone: "gold" })
      ]
    },
    {
      id: "biggest-fish",
      title: "Aquarium Optics",
      subtitle: "Huge in the ocean can still be tiny on the board.",
      tag: "Screen Trick",
      mechanic: "On-screen size",
      theme: "screen",
      promptHtml: "Tap the biggest fish.",
      hint: "Biggest means biggest on this board.",
      solution: { kind: "tap", target: "goldfish" },
      success: "Correct. The goldfish takes up the most space here.",
      wrong: "The screen is lying to your real-world instincts again.",
      items: [
        card("whale", "🐋", "Whale", 16, 24, 14, 12, { tone: "cyan" }),
        card("goldfish", "🐟", "Goldfish", 52, 20, 24, 22, { tone: "gold" }),
        card("shark", "🦈", "Shark", 24, 62, 20, 14, { tone: "slate" })
      ]
    },
    {
      id: "darkest-color",
      title: "Shade Test",
      subtitle: "The clue itself can become your tool.",
      tag: "Prompt Drag",
      mechanic: "Drag from the clue",
      theme: "word",
      promptHtml: `Find the ${dragWord("darkest")} color.`,
      hint: "Drag the word darkest onto the darkest swatch.",
      solution: { kind: "dragPromptWord", word: "darkest", target: "charcoal" },
      success: "Right. The charcoal swatch wins.",
      wrong: "Use the prompt word as the selector.",
      items: [
        card("sky", "", "Sky", 14, 24, 20, 24, { tone: "cyan" }),
        card("coral-swatch", "", "Coral", 40, 24, 20, 24, { tone: "coral" }),
        card("charcoal", "", "Charcoal", 66, 24, 20, 24, {
          tone: "ink",
          acceptWord: "darkest"
        })
      ]
    },
    {
      id: "hidden-heart",
      title: "Scene Detail",
      subtitle: "Not every hidden object needs a moving part.",
      tag: "Hidden Object",
      mechanic: "Tiny target",
      theme: "hidden",
      promptHtml: "Find the hidden heart.",
      hint: "Look at the clothing detail, not the faces.",
      solution: { kind: "tap", target: "heart" },
      success: "There it is. Costume details are fair game.",
      wrong: "Look for a tiny heart shape inside the scene.",
      items: [
        card("person-a", "🧥", "Jacket", 16, 20, 20, 28, { tone: "slate", interactive: false }),
        card("person-b", "🧣", "Scarf", 48, 18, 22, 30, { tone: "violet", interactive: false }),
        card("person-c", "🧥", "Coat", 72, 24, 18, 26, { tone: "slate", interactive: false }),
        bubble("heart", "🩷", "", 58, 30, 7, 10, { tone: "coral", fontSize: "0.9rem" })
      ]
    },
    {
      id: "extra-spot",
      title: "Duplicate Trouble",
      subtitle: "The extra answer can be any copy of the repeated word.",
      tag: "Word Scan",
      mechanic: "Tap any duplicate",
      theme: "count",
      promptHtml: "Tap the extra word.",
      hint: "One word appears twice. Either copy proves you found the duplicate.",
      solution: { kind: "tapAny", targets: ["spot-a", "spot-b"] },
      success: "Exactly. Spot is the duplicated word.",
      wrong: "Find the word that appears twice.",
      items: [
        textTag("spin", "Spin", 12, 22, 18, 14, { tone: "slate" }),
        textTag("spot-a", "Spot", 40, 24, 18, 14, { tone: "gold" }),
        textTag("stop", "Stop", 68, 28, 18, 14, { tone: "slate" }),
        textTag("spot-b", "Spot", 32, 58, 18, 14, { tone: "gold" })
      ]
    },
    {
      id: "lightest-object",
      title: "Literal Light",
      subtitle: "Weight is not the only meaning of light.",
      tag: "Word Trick",
      mechanic: "Literal wording",
      theme: "word",
      promptHtml: "Tap the lightest object.",
      hint: "Read light as something that makes light.",
      solution: { kind: "tap", target: "bulb" },
      success: "Correct. The bulb is literally the light-est object.",
      wrong: "Try the other meaning of light.",
      items: [
        card("feather", "🪶", "Feather", 12, 38, 18, 18, { tone: "slate" }),
        bubble("bulb", "💡", "Bulb", 46, 24, 18, 18, { tone: "gold" }),
        card("lantern", "🏮", "Lantern", 72, 40, 18, 18, { tone: "coral" })
      ]
    },
    {
      id: "find-champion",
      title: "Podium Claim",
      subtitle: "The clue can label the winner after the race is over.",
      tag: "Prompt Drag",
      mechanic: "Drag from the clue",
      theme: "word",
      promptHtml: `Find the ${dragWord("champion")}.`,
      hint: "The green center step is where the champion belongs.",
      solution: { kind: "dragPromptWord", word: "champion", target: "winner-step" },
      success: "Exactly. The center podium step becomes the champion.",
      wrong: "Drag the word onto the correct podium step.",
      items: [
        card("left-step", "🥉", "Third", 18, 54, 18, 18, { tone: "slate" }),
        card("winner-step", "🥇", "Center", 42, 42, 22, 24, {
          tone: "lime",
          acceptWord: "champion"
        }),
        card("right-step", "🥈", "Second", 70, 50, 18, 18, { tone: "slate" })
      ]
    }
  ];
})();
