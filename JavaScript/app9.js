//Default Parameter

function func(a,b=2){
    console.log(`a=${a}, b=${b}`);
}

func(2);
func(3,5);

let sum=function(a,b){
    return a+b;
}

console.log(sum(1));        //Only one arg -> output= not a number (NaN) 

//Spread

let arr=[1,2,3,4];

console.log(1,2,3,4);
console.log(...arr);

console.log(Math.min(...arr));
arr.push(0);
console.log(Math.min(...arr));

let newArr=[...arr];            //Spread with Array Literals
console.log(newArr);

let charArr=[..."Hello"];
console.log(charArr);

let odd=[1,3,5];
let even=[2,4,6];
let res=[...odd, ...even];
console.log(res);


const obj={
    name: "sahitya",
    email: "abc@gmail.com"
};

const copyobj={...obj, id:123}; //Spread object to object
console.log(copyobj);

const copyobj2={...arr};        //Spread array to object
console.log(copyobj2);          //(index=key, array element=value)

const copyobj3={..."Hello"};       //Spread string to object
console.log(copyobj3);

//Rest

function func(...args){
    for(let i=0;i<args.length;i++){
        console.log("Element "+i+": "+args[i]);
    }
}
func(1,2,3,4);

function func2(...args){
    console.log(arguments);     //Arguments collection
    console.log(arguments.length);
}
func2(1,2,3,4);


function min(msg,...args){
    console.log(msg);
    console.log(args.reduce((res,el)=>{
        if(res<el) return res;
        else return el;
    }));
}

min(1,2,3,4,6,5,7);

//Destructuring

let arr2=[1,2,3,4,5];           //Array Destructurin
let [one,two,...others]=arr2;
console.log(one);
console.log(two);
console.log(others);

const student={
    name:"abc",
    age:22,
    email:"abc@gmail.com",
    username:"abcd"
}

let {username,password}=student;        //same variable name as object key
console.log(username);
console.log(password);  //undefined

let {username:user,age,city="Mumbai"}=student; //store username in user variable and add city
console.log(user);
console.log(age);
console.log(city);      //If no city info present, assign Mumbai as default

let {username:user2,city:place="Mumbai"}=student;        //same variable name as object key
console.log(user2);
console.log(place);  //undefined