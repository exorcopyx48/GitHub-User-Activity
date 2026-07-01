import readLine from 'readline'
import chalk from 'chalk'

interface Event {
    status: string,
    type: string,
    repo: {
        name: string
    }
}

async function fetchEvents(userName: string): Promise<Event[]> {

    const res = await fetch(`https://api.github.com/users/${userName}/events`);
    if(!res.ok){
        if (res.status === 404) {
            throw new Error("No User");
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    return res.json()
}


async function app(user: string) {
    try {
        const data = await fetchEvents(user);
        
        if (data.length === 0) {
            console.log("No recent activity");
            return;
        }
        
        const counter = new Map<string, Map<string, number>>();
        data.forEach((value: Event) => {
            const info: Map<string, number> = counter.get(value.repo.name)?? new Map<string, number>();
            const count: number = info.get(value.type) ?? 0; 
            
            info.set(value.type, count+1);

            counter.set(value.repo.name, info);

        });

        counter.forEach((value: Map<string, number> , repo: string) => {
            value.forEach((count: number, event: string)=>{
                console.log(`${count} ${chalk.yellow(event)} on ${chalk.blueBright(repo)} repo`)
                
            })
        });

    } catch (err) {
        const error: Error = err as Error;
        if(error.message === "No User"){
            console.log(`User: ${chalk.red(user)} not found`)
        }else{
            console.log(`Error:  ${error.message}`)
        }
    }

}

const rl = readLine.createInterface(
    {
        input: process.stdin,
        output: process.stdout,
        prompt: "User Activity > "
    }
)

console.log("Enter the username (exit with --close)");
rl.prompt();

rl.on("line", (line: string) => {
    const input = line.trim();
    if(input === "--close") {
        rl.close();
        return;
    }
    app(input);
});
