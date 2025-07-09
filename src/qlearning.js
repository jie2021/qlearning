import { zeros } from 'mathjs';

// 미로 환경 설정
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1],//5
    [1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],//10
    [1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1], //15
    [1,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1], //20
    [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1]
    
];

const start = [0, 11];
const goal = [20, 9];

// Q-learning 파라미터 설정
const alpha = 0.1; // 학습률
const gamma = 0.9; // 할인율
const epsilon = 0.1; // 탐험률

// Q 테이블 초기화
const qTable = zeros(maze.length, maze[0].length, 4).toArray();

// 가능한 행동 정의 (상, 하, 좌, 우)
const actions = [
    [-1, 0], // 상
    [1, 0],  // 하
    [0, -1], // 좌
    [0, 1]   // 우
];

// 보상 함수 정의
function getReward(state) {
    const [x, y] = state;
    if (x === goal[0] && y === goal[1]) {
        return 100; // 목표 지점 도달 시 큰 보상
    }
    return -1; // 일반적인 이동 시 작은 보상
}

// 다음 상태 계산
function getNextState(state, action) {
    const [x, y] = state;
    const [dx, dy] = action;
    const nextState = [x + dx, y + dy];
    if (nextState[0] < 0 || nextState[0] >= maze.length || nextState[1] < 0 || nextState[1] >= maze[0].length || maze[nextState[0]][nextState[1]] === 1) {
        return state; // 벽에 부딪히면 현재 상태 유지
    }
    return nextState;
}

// Q-learning 알고리즘
async function qLearning() {
    var maxEpisodes = parseInt(document.getElementById('episodes').value) || 1000;
    console.log(maze)
    for (let episode = 0; episode < maxEpisodes; episode++) {
        let state = start;
        console.log(`Episode ${episode + 1}: Starting at state ${state}`);
        while (true) {
            // 탐험 또는 활용 결정
            let action;
            if (Math.random() < epsilon) {
                action = actions[Math.floor(Math.random() * actions.length)]; // 탐험
            } else {
                const qValues = qTable[state[0]][state[1]];
                action = actions[qValues.indexOf(Math.max(...qValues))]; // 활용
            }

            const nextState = getNextState(state, action);
            const reward = getReward(nextState);

            // Q 값 업데이트
            const qValue = qTable[state[0]][state[1]][actions.indexOf(action)];
            const maxNextQValue = Math.max(...qTable[nextState[0]][nextState[1]]);
            qTable[state[0]][state[1]][actions.indexOf(action)] = qValue + alpha * (reward + gamma * maxNextQValue - qValue);

            state = nextState;

            if (state[0] === goal[0] && state[1] === goal[1]) {
                
                break; // 목표 지점 도달 시 종료
            }
            
        }
        await delay(1);
        if(episode%10==0) displayMaze();
    }
    displayOptimalPath();
    
}

// delay 함수 정의
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 미로 표시 함수
export function displayMaze() {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (maze[i][j] === 1) {
                cell.classList.add('wall');
            } else if (i === start[0] && j === start[1]) {
                cell.classList.add('start');
            } else if (i === goal[0] && j === goal[1]) {
                cell.classList.add('goal');
            } else if (qTable[i][j].some(q => q > 0)) {
                cell.classList.add('path');
            }
            mazeContainer.appendChild(cell);
        }
    }
}

// 최단 경로 찾기 함수
function findOptimalPath() {
    let state = [...start];
    const path = [state.slice()];
    const visited = new Set();
    let steps = 0;
    const maxSteps = maze.length * maze[0].length * 4; // reasonable upper bound

    while ((state[0] !== goal[0] || state[1] !== goal[1]) && steps < maxSteps) {
        const key = `${state[0]},${state[1]}`;
        if (visited.has(key)) {
            // Detected a loop, break to avoid infinite loop
            break;
        }
        visited.add(key);

        const qValues = qTable[state[0]][state[1]];
        const bestAction = actions[qValues.indexOf(Math.max(...qValues))];
        const nextState = getNextState(state, bestAction);

        // If agent doesn't move, break to avoid infinite loop
        if (nextState[0] === state[0] && nextState[1] === state[1]) {
            break;
        }

        state = nextState;
        path.push(state.slice());
        steps++;
    }
    return path;
}

// 최단 경로 표시 함수
function displayOptimalPath() {
    const path = findOptimalPath();
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (maze[i][j] === 1) {
                cell.classList.add('wall');
            } else if (i === start[0] && j === start[1]) {
                cell.classList.add('start');
            } else if (i === goal[0] && j === goal[1]) {
                cell.classList.add('goal');
            } else if (path.some(p => p[0] === i && p[1] === j)) {
                cell.classList.add('path');
            }
            mazeContainer.appendChild(cell);
        }
    }
}



// Q-learning 실행후 최단경로 표시
export function runQLearning() {
    console.log('Starting Q-learning...');
    
    qLearning();
    
}
