//Array Methods

let arr=[1,2,3,4,5];

let arr2=[                  //Using Array of objects
    {
        name:"sahitya",
        marks: 95
    },
    {
        name:"mali",
        marks:93
    },
    {
        name:"naveen",
        marks:92
    }
];

//forEach()

let print=function(el){
    console.log(el);
}

arr.forEach(print);         //Using function name

arr.forEach(function(el){   //Using function definition
    console.log(el);
});

arr.forEach(el=>console.log(el));       //Using arrow function


arr2.forEach(s=>console.log(s.name));
arr2.forEach(s=>console.log(s.marks));


//map()

let double=arr.map(el=>el*2);       //double array of arr
console.log(double);

let undefinedArr=arr.map(el=>{});      //no return value, so undefined
console.log(undefinedArr);

let gpa=arr2.map(el=>el.marks/10);
console.log(gpa);

//filter()

let evenArr=arr.filter(el=>el%2==0);    //true for even elements
console.log(evenArr);

let ans=arr.filter(el=>el<3);       //true for elements less than 3
console.log(ans);


//every()- just like logical AND

console.log(arr.every(el=>el<6));
console.log(arr.every(el=>el%2==0));

//some()- just like logical OR

console.log(arr.some(el=>el>5));
console.log(arr.some(el=>el%2==0));

//reduce() 

let sum=(res,el)=>res+el;      //Accumulator res, Element el
console.log(arr.reduce(sum));


let max=(res,el)=>{         //Find max value of array using reducer function
    if(res>el) return res;
    else return el;
}

console.log(arr.reduce(max));

let min=(res,el)=>{         //Find min value of array using reducer function
    if (res<el) return res;
    else return el;
}

console.log(arr.reduce(min));

console.log(arr.every(el=>el%10==0));
