process.stdin.setEncoding("utf8");
const readline = require("readline");

async function readLines() {
    const lines = [];
    const reader = readline.createInterface({
        input: process.stdin,
    });
    reader.on("line", (line) => lines.push(line));

    return new Promise((resolve) => {
        reader.on("close", () => {
            resolve(lines);
        });
    })
}

function toDataSets(lines) {
    const dataSets = [];
    while (lines.length) {
        const dataSet = { sections: [], stones: [] }

        dataSet.sectionLength = Number(lines.shift());
        if (dataSet.sectionLength === 0) {
            break;
        }
        for (let i = 0; i < dataSet.sectionLength; i++) {
            const section = lines.shift().split(' ').map(p => Number(p));
            dataSet.sections.push(section)
        }

        dataSet.stoneLength = Number(lines.shift());
        for (let i = 0; i < dataSet.stoneLength; i++) {
            const stone = lines.shift().split(' ').map(p => Number(p));
            dataSet.stones.push(stone)
        }
        dataSet.goal = lines.shift().split(' ').map(p => Number(p));
        dataSets.push(dataSet)
    }
    return dataSets;
}

async function main() {
    const lines = await readLines()
    solve(toDataSets(lines)[0])
}

function solve(data_set) {
    console.log(data_set);
    dump(data_set.sections);
    const next_steps = nextSteps(data_set);
}

function nextSteps({ sections, stones }) {
    // i ごとに動かす、動かさないのパターンを枝刈りしながら木構造に
    for (let i = 0; i < sections.length; i++) {
        const current = sections[i]
        const siblings = [
            ...(i - 1 >= 0 ? [sections[i - 1]] : []),
            ...(i + 1 < sections.length ? [sections[i + 1]] : []),
        ]

        // むずい
    }
}

const moves = [
    [0, 0], // 動かさない
    [1, 0],
    // [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    // [-1, -1],
    [0, -1],
    [1, -1],
]

function dump(sections) {
    console.log('  -5-4-3-2-1 0 1 2 3 4');
    for (let i = -5; i < 5; i++) {
        let line = '';
        for (let j = -5; j < 5; j++) {
            let c = ' .';
            for (let k = 0; k < sections.length; k++) {
                const section = sections[k];
                if (section[0] === j && section[1] === i) {
                    c = (k === 0 ? ' x' : ' o');
                }
            }
            line = line + c;
        }
        console.log(String(i).padStart(2) + line);
    }
}

main();
