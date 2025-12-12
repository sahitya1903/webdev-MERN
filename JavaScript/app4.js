//Objects

let delhi={
    latitude: "28.7041 N",
    longitude: "23.4555 E"
};

const item={
    price:100,
    discount: 50,
    colors: ['red','pink'],
};


const post={
    username: 'sahitya',
    content: "This is first post",
    likes: 150,
    repost: 10,
    tags: ["@apnacollege","@alpha"]
};

console.log(post["likes"]);
console.log(post["tags"]);
console.log(post.content);
console.log(post.tags);
console.log(post.tags[0]);

let prop="repost";
console.log(post[prop]);

const obj={
    1: 'a',
    2: 'b',
    true: 'c',
    null: 'd',
    undefined: 'e'
};

console.log(obj[1]);
console.log(obj['1']);

const student={
    name:'sahitya',
    age:23,
    marks:94
};

console.log(student.age);
student.city="delhi";
console.log(student);

delete student.city;
console.log(student);


//Object of objects

const infoobj= {
    "aman": {
        grade:"A+",
        city:"Delhi"
    },
    "shradha": {
        grade: "A",
        city: "Pune"
    }
};

console.log(infoobj);
console.log(infoobj.aman);
console.log(infoobj.shradha.city);

//Array of objects

const infoarr= [
    {   
        name: "aman",
        grade:"A+",
        city:"Delhi"
    },
    {
        name: "shradha",
        grade: "A",
        city: "Pune"
    }
];

console.log(infoarr);
console.log(infoarr[0]);
console.log(infoarr[0].grade);


console.log(Math);
console.log(Math.E);
console.log(Math.abs(-2));
console.log(Math.pow(2,3));
console.log(Math.floor(-3.5));
console.log(Math.ceil(-3.5));
console.log(Math.round(3.55));
console.log(Math.random());

let num=Math.random();
num=10*num;
num=Math.floor(num)+1; //range is 1 to 10 after adding 1
console.log(num);


let num2=Math.floor(100*Math.random())+1;
console.log(num2);  //random number b/w 1 to 100


let num3=Math.floor(5*Math.random())+21;
console.log(num3);  //random number b/w 21 to 25