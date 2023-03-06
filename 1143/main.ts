import { dump, dumpSectionNode } from "./dumper";
import { DataSet, Section, SectionNode } from "./types";

process.stdin.setEncoding("utf8");
const readline = require("readline");

async function readLines(): Promise<string[]> {
  const lines: string[] = [];
  const reader = readline.createInterface({
    input: process.stdin,
  });
  reader.on("line", (line: string) => lines.push(line));

  return new Promise((resolve) => {
    reader.on("close", () => {
      resolve(lines);
    });
  });
}

function toDataSets(lines: string[]) {
  const dataSets: DataSet[] = [];
  while (lines.length) {
    const sectionLength = Number(lines.shift());
    if (sectionLength === 0) {
      break;
    }
    const sections: Section[] = [];
    for (let i = 0; i < sectionLength; i++) {
      const line = lines.shift() as string;
      const section = line.split(" ").map((p) => Number(p));
      sections.push(section as Section);
    }

    const stoneLength = Number(lines.shift());
    const stones: Section[] = [];
    for (let i = 0; i < stoneLength; i++) {
      const line = lines.shift() as string;
      const stone = line.split(" ").map((p) => Number(p));
      stones.push(stone as Section);
    }
    const line = lines.shift() as string;
    const goal = line.split(" ").map((p) => Number(p));
    dataSets.push({
      sections,
      stones,
      goal: goal as Section,
    });
  }
  return dataSets;
}

async function main() {
  const lines = await readLines();
  const data_set = toDataSets(lines)[2];
  let result = solve(data_set);
  console.log(result);
  // while (result) {
  //   console.log("move:", result.move);
  //   dump(result.sections, data_set.stones, data_set.goal);
  //   console.log();
  //   result = result.parent;
  // }
}

type Step = {
  sections: Section[];
  move: number;
  parent: Step | null;
};
function solve({ sections, stones, goal }: DataSet) {
  console.log({ sections, stones, goal });
  dump(sections, stones, goal);
  console.log("---- ---- ----");
  const queue: Step[] = [{ sections, move: 0, parent: null }];
  const memo = new Map<string, number>();
  while (queue.length) {
    const current_step = queue.shift();
    if (!current_step) {
      break;
    }
    if (current_step.move === 20) {
      console.log(current_step);
      break;
    }
    const next_steps = nextSteps({ sections: current_step.sections, stones });
    for (const next_step of next_steps) {
      const next_sections = next_step
        .map((f) => f.section)
        .filter((s): s is Section => s !== null);
      if (isConflict(next_sections[0], goal)) {
        return {
          sections: next_sections,
          move: current_step.move + 1,
          parent: current_step as Step | null,
        };
      } else {
        const serialized = serializeSections(next_sections);
        const cached = memo.get(serialized);
        const next_move = current_step.move + 1;
        if (cached && cached < next_move) {
          //
        } else {
          queue.push({
            sections: next_sections,
            move: next_move,
            parent: current_step,
          });
          memo.set(serialized, next_move);
        }
      }
      // dump(
      //   next_step.map((f) => f.section).filter((s): s is Section => s !== null),
      //   stones,
      //   goal
      // );
    }
  }
  return null;
}

function serializeSections(sections: Section[]): string {
  return sections.reduce((str, section) => {
    return str + `:${section[0]},${section[1]}`;
  }, "");
}

function nextSteps({
  sections,
  stones,
}: {
  sections: Section[];
  stones: Section[];
}) {
  // i ごとに動かす、動かさないのパターンを枝刈りしながら木構造に?
  const root = {
    section: null,
    children: [],
    parent: null,
    moved: null,
  };
  _nextSteps({ sections, stones, prev_node: root, i: 0 });
  // console.dir(root, { depth: null });
  const [_, ...flattened] = flattenSectionNode([], root);
  const filtered = flattened
    .map(([_, ...step]) => step)
    .filter((step) => step.length === sections.length);
  console.log(filtered.length);
  dumpSectionNode(flattened.filter((f) => f.length));
  return filtered;
}

const moves: [number, number][] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [1, -1],
  [-1, 1],
  [-1, 0],
];

function _nextSteps({
  sections,
  stones,
  prev_node,
  i,
}: {
  sections: Section[];
  stones: Section[];
  prev_node: SectionNode;
  i: number;
}) {
  const current_section = sections[i];
  const next_section = i + 1 < sections.length ? sections[i + 1] : null;

  const prevs: Section[] = [];
  let traverse = prev_node.parent;
  while (traverse && traverse.section) {
    prevs.push(traverse.section);
    traverse = traverse.parent;
    // traverse しながらチェックすると少し削れる
  }

  // 癒着のチェックは先の節に対して行っていないので、動かなくても癒着していることがある
  if (!prevs.some((prev) => isSiblings(current_section, prev))) {
    prev_node.children.push({
      moved: false,
      parent: prev_node,
      section: current_section,
      children: [],
    });
  }

  if (prev_node.moved === true) {
    // 一個前の node が動いたのでこの node は動けない
  } else {
    for (const move of moves) {
      const new_section: Section = [
        current_section[0] + move[0],
        current_section[1] + move[1],
      ];
      // 石とは「衝突していたらダメ」
      if (stones.some((s) => isConflict(new_section, s))) {
        continue;
      }
      // 次の節・前の節とは「隣り合っていなかったらダメ」 -> 隣あっていたら衝突していない
      const siblings = [
        ...(next_section ? [next_section] : []),
        ...(prev_node.section ? [prev_node.section] : []),
      ];
      if (siblings.some((sibling) => !isSiblings(new_section, sibling))) {
        continue;
      }
      // 前の節より前の節たちとは「衝突していたらダメ」「隣り合っていたらダメ」
      if (
        prevs.some((prev) => isConflict(new_section, prev)) ||
        prevs.some((prev) => isSiblings(new_section, prev))
      ) {
        continue;
      }
      prev_node.children.push({
        moved: true,
        parent: prev_node,
        section: new_section,
        children: [],
      });
    }
  }

  if (next_section) {
    for (const node of prev_node.children) {
      _nextSteps({ sections, stones, prev_node: node, i: i + 1 });
    }
  }
}

// ぶつかっている
function isConflict(section_a: Section, section_b: Section) {
  return section_a[0] === section_b[0] && section_a[1] === section_b[1];
}

// 隣り合っている（衝突しているかもしれない）
function isSiblings(section: Section, next_section: Section) {
  return moves.some(
    (move) =>
      section[0] + move[0] === next_section[0] &&
      section[1] + move[1] === next_section[1]
  );
}

function flattenSectionNode(
  list: SectionNode[],
  node: SectionNode
): SectionNode[][] {
  if (node.children.length === 0) {
    return [[...list, node]];
  } else {
    return node.children.flatMap((child) =>
      flattenSectionNode([...list, node], child)
    );
  }
}

main();
