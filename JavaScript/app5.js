function hello() {
    console.log("Hello, World!");
}


function loop(){
    for(let i=0;i<5;i++){
        console.log(i);
    }
}


// let func =prompt("Enter function:");
// if(func=="hello"){
//     hello();
// }else{
//     loop();
// }

function dice(){
    console.log(Math.floor(6*Math.random())+1);
    //random number between 1 to 6
}

dice();

function printName(name){
    console.log(name);
}

printName("sahitya");

function printInfo(name,age){
    console.log(`Name: ${name}`);
    console.log(`Age: ${age}`);
}

printInfo("Sahitya",22);
printInfo("Mali");

function sum(a,b){
    return a+b;
}

let a=sum(2,3);
console.log(a);
console.log(sum(3,4));
console.log(sum(1,sum(2,3)));

function avg(a,b,c){
    average=(a+b+c)/3;
    console.log(average);
}

avg(1,2,3);

console.log(avg);


function table(n){
    for(let i=1;i<11;i++){
        console.log(`${n}*${i}=${n*i}`);
    }
}

table(6);


function nsum(n){
    // ans=n*(n+1)/2;
    let ans=0;
    for(let i=0;i<=n;i++){
        ans+=i;
    }
    return ans;
}

console.log(nsum(5));

function concatstr(arr){
    let ans="";
    for(let i=0;i<arr.length;i++){
        ans+=arr[i];
    }
    return ans;
}

console.log(concatstr(["i","am","sahitya"]));

// //Leetcode Javascript Q1
// /**
//  * @return {Function}
//  */
// var createHelloWorld = function() {
    
//     return function(...args) {
//         return "Hello World";
//     }
// };

// /**
//  * const f = createHelloWorld();
//  * f(); // "Hello World"
//  */

// console.log(createHelloWorld()());