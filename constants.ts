import { DialogueLine } from './types';

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 1000;
export const TILE_SIZE = 32;

export const OPENING_DESCENT_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'Yo... why am I falling?', emotion: 'panic' },
  { speaker: 'Angel 1', text: 'Please remain calm. This is a controlled descent.', emotion: 'calm' },
  { speaker: 'Angel 2', text: "BRO, WE'RE LOSING ALTITUDE!", emotion: 'panic' },
  { speaker: 'Angel 1', text: "We're supposed to lose altitude. We're landing.", emotion: 'calm' },
  { speaker: 'Ain', text: "Could've mentioned that before I started questioning my life choices.", emotion: 'smug' },
  { speaker: 'Angel 3', text: 'Flower garden incoming!', emotion: 'cheerful' },
  { speaker: 'Ain', text: 'Wait, that entire thing is flowers?', emotion: 'shock' },
  { speaker: 'Angel 2', text: 'Yep! Five-star landing zone!', emotion: 'cheerful' },
  { speaker: 'Angel 1', text: 'Three, two, one...', emotion: 'calm' }
];

export const OPENING_LANDING_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'Okay. Not gonna lie, that was kinda cool.', emotion: 'happy' },
  { speaker: 'Angel 2', text: 'Ten out of ten landing!', emotion: 'cheerful' },
  { speaker: 'Angel 1', text: 'You nearly landed in the fountain.', emotion: 'calm' },
  { speaker: 'Ain', text: 'And yet... here I am.', emotion: 'smug' },
  { speaker: 'Angel 3', text: 'Delivery complete.', emotion: 'cheerful' },
  { speaker: 'Angel 2', text: 'Do we get snacks for this?', emotion: 'happy' },
  { speaker: 'Angel 1', text: 'No.', emotion: 'calm' },
  { speaker: 'Angel 2', text: 'Worst job ever.', emotion: 'panic' }
];

export const AIDIL_GIFT_DIALOGUE: DialogueLine[] = [
  { speaker: 'Aidil', text: 'Yo, there you are.', emotion: 'happy' },
  { speaker: 'Ain', text: 'Bro, what are you doing here?', emotion: 'neutral' },
  { speaker: 'Aidil', text: 'Waiting. Obviously.', emotion: 'smug' },
  { speaker: 'Ain', text: "You could've at least looked busy.", emotion: 'smug' },
  { speaker: 'Aidil', text: 'I was. Mentally preparing for this conversation.', emotion: 'cheerful' },
  { speaker: 'Ain', text: "Wow. Must've been exhausting.", emotion: 'smug' },
  { speaker: 'Aidil', text: 'Careful... you might get used to me surprising you.', emotion: 'happy' },
  { speaker: 'Ain', text: 'Oh? Is that a promise?', emotion: 'smug' },
  { speaker: 'Aidil', text: 'Depends. Are you going to hold me to it?', emotion: 'happy' },
  { speaker: 'Ain', text: 'Maybe.', emotion: 'happy' }
];

export const TRANSFORMATION_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'Uh... Aidil?', emotion: 'shock' },
  { speaker: 'Aidil', text: 'Okay, before you panic...', emotion: 'panic' },
  { speaker: 'Ain', text: 'BRO?!', emotion: 'panic' },
  { speaker: 'Aidil', text: 'Yeah, this is probably not ideal.', emotion: 'panic' }
];

export const CONFRONTATION_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'Aidil! What are you doing?!', emotion: 'angry' },
  { speaker: 'Shadow Titan', text: 'ROOOAAARRRRRR!!', emotion: 'angry' },
  { speaker: 'Ain', text: "Okay. Guess we're doing this the hard way.", emotion: 'smug' }
];

export const HAND_BITE_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'HEY! PUT ME DOWN, YOU OVERGROWN LIZARD!', emotion: 'angry' },
  { speaker: 'Titan', text: 'WHY WOULD YOU DO THAT?!', emotion: 'shock' },
  { speaker: 'Ain', text: "WHAT IS WRONG WITH YOU?! YOU'RE THE ONE TRYING TO EAT ME!", emotion: 'angry' },
  { speaker: 'Ain', text: "THAT'S WHAT YOU GET FOR GRABBING ME!", emotion: 'angry' },
  { speaker: 'Titan', text: '*GROWLS ANGRILY*', emotion: 'angry' },
  { speaker: 'Ain', text: "YOU'VE BEEN SAYING THAT FOR FIVE MINUTES! GET NEW MATERIAL!", emotion: 'smug' }
];

export const FINISHER_DIALOGUE: DialogueLine[] = [
  { speaker: 'Ain', text: 'Aidil... that’s enough.', emotion: 'calm' },
  { speaker: 'Ain', text: "I know you're still in there. Come on, bro. We're not ending things like this.", emotion: 'happy' },
  { speaker: 'Ain', text: "You've caused enough chaos for one birthday.", emotion: 'happy' }
];

export const RESTORATION_DIALOGUE: DialogueLine[] = [
  { speaker: 'Aidil', text: 'So... about the whole giant monster thing.', emotion: 'shock' },
  { speaker: 'Ain', text: 'Yeah?', emotion: 'smug' },
  { speaker: 'Aidil', text: "We probably shouldn't make that a birthday tradition.", emotion: 'happy' },
  { speaker: 'Ain', text: 'Probably not.', emotion: 'smug' },
  { speaker: 'Aidil', text: 'Good talk.', emotion: 'happy' }
];

export const CELEBRATION_DIALOGUE_PART1: DialogueLine[] = [
  { speaker: 'Villager', text: 'Ain! You saved our village!', emotion: 'happy' },
  { speaker: 'Villager', text: 'And you saved Aidil!', emotion: 'cheerful' },
  { speaker: 'Villagers', text: 'AIN! AIN! AIN!', emotion: 'happy' },
  { speaker: 'Ain', text: "Guys, it wasn't that big of a deal...", emotion: 'neutral' },
  { speaker: 'Villager', text: 'You fought a giant monster!', emotion: 'shock' },
  { speaker: 'Villager', text: 'ON YOUR BIRTHDAY!', emotion: 'cheerful' },
  { speaker: 'Ain', text: 'Okay, when you put it like that...', emotion: 'smug' },
  { speaker: 'Villager', text: 'THREE CHEERS FOR AIN!', emotion: 'cheerful' },
  { speaker: 'Ain', text: 'Wait. WAIT—', emotion: 'panic' }
];

export const CELEBRATION_DIALOGUE_AFTER_TOSSES: DialogueLine[] = [
  { speaker: 'Ain', text: 'Not a word.', emotion: 'smug' },
  { speaker: 'Aidil', text: "I didn't say anything.", emotion: 'happy' },
  { speaker: 'Ain', text: "You're thinking it.", emotion: 'smug' },
  { speaker: 'Aidil', text: '...Maybe.', emotion: 'happy' }
];

export const CAKE_DIALOGUE: DialogueLine[] = [
  { speaker: 'Aidil', text: 'Finally. Cake.', emotion: 'happy' },
  { speaker: 'Ain', text: 'You helped save the village and that’s what you’re excited about?', emotion: 'smug' },
  { speaker: 'Aidil', text: 'Have you tried the cake?', emotion: 'cheerful' },
  { speaker: 'Ain', text: '...Fair point.', emotion: 'happy' }
];

export const FINAL_LETTER_LINE_1 = 'I wish the best for ur future';
export const FINAL_LETTER_LINE_2 = '— your friend, Aidil.';
