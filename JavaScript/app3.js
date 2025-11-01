for(let i=0;i<3;i++){
    console.log(i);
}

for(let i=10;i>0;i=i-3){
    console.log(i);
}

// //Table of n
// let n=parseInt(prompt("Enter number:"))
// for(let i=1;i<=10;i++){
//     console.log(i*n);
// }

for(let i=0;i<3;i++){
    console.log(`Outer loop: ${i}`)
    for(let j=0;j<3;j++){
        console.log(`Inner Loop: ${j}`);
    }
}

// let j=1;
// while (j<=10) {
//     console.log(j);
//     j++;
// }


// let favMovie="Avatar";
// let guess=prompt("Enter guessed movie name or 'quit' to exit.")
// while (guess!=favMovie) {
//     if (guess=="quit") {
//         console.log("You quit.")
//         break;
//     }
//     console.log("Wrong answer")
//     guess=prompt("Please try again.");
// }
// if (guess==favMovie) {
//     console.log("Congrats!")
// }


let fruits=['apple','mango','grapes','quava','banana'];
for(let i=0;i<fruits.length;i++){
    console.log(i,fruits[i]);
}

for(let i=fruits.length-1;i>=0;i--){
    console.log(i,fruits[i]);
}

let student=[['aman',95],['shradha',94.4],['karan',100]];
for(let i=0;i<student.length;i++){
    console.log(`Info of Student ${i+1}`)
    for(let j=0;j<student[i].length;j++){
        console.log(student[i][j]);
    }
}

for(fruit of fruits){
    console.log(fruit);
}

for(char of "Sahitya"){
    console.log(char);
}

for(list of student){
    for(item of list){
        console.log(item);
    }
}