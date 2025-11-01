let todo=['study','bath','travel'];

while(true){
    let req=prompt("Please enter your request:")
    if(req=='quit'){
        console.log("Quitting app.");
        break;
    }

    if (req=="list") {
        console.log("-----------------");
        for (task=0;task<todo.length;task++){
            console.log(task,todo[task]);
        }
        console.log("-----------------");
    }else if(req=="add"){
        let a=prompt("Enter task to add:");
        todo.push(a);
        console.log(`Task ${a} added successfully`);
        console.log("-----------------");
    }
    else if(req=="delete"){
        let b=parseInt(prompt("Enter task index to delete:"));
        todo.splice(b,1);
        console.log(`Task at index ${b} deleted successfully`);
        console.log("-----------------");
    }else{
        console.log("Invalid request.");
        break;
    }
}