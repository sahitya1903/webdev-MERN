//Array Methods

let arr=[1,2,3,4,5];

let print=function(el){
    console.log(el);
}

arr.forEach(print);         //Using function name

arr.forEach(function(el){   //Using function definition
    console.log(el);
});

arr.forEach(el=>console.log(el));       //Using arrow function


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

arr2.forEach(s=>console.log(s.name));
arr2.forEach(s=>console.log(s.marks));


let double=arr.map(el=>el*2);       //double array of arr
console.log(double);

let undefinedArr=arr.map(el=>{});      //no return value, so undefined
console.log(undefinedArr);

let gpa=arr2.map(el=>el.marks/10);
console.log(gpa); 