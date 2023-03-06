import { Section, SectionNode } from "./types";

export function dump(sections: Section[], stones: Section[], goal: Section) {
  console.log("  -5-4-3-2-1 0 1 2 3 4");
  for (let i = -5; i < 5; i++) {
    let line = "";
    for (let j = -5; j < 5; j++) {
      let c = " .";
      for (let k = 0; k < sections.length; k++) {
        const section = sections[k];
        if (section[0] === j && section[1] === i) {
          c = k === 0 ? " x" : " o";
        }
      }
      for (let k = 0; k < stones.length; k++) {
        const stone = stones[k];
        if (stone[0] === j && stone[1] === i) {
          c = " s";
        }
      }
      if (goal[0] === j && goal[1] === i) {
        c = " *";
      }

      line = line + c;
    }
    console.log(String(i).padStart(2) + line);
  }
}

export function dumpSectionNode(list: SectionNode[][]) {
  for (const nodes of list) {
    const [_, ...tail] = nodes;
    console.log(JSON.stringify(tail.map((node) => node.section)));
  }
}
