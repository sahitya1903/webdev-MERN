console.dir(document);
console.dir(document.all);

console.dir(document.all[9].innerText);
document.all[9].innerText="Sahitya";          //Spider Man modified to Sahitya

let obj=document.getElementById("mainImg");
console.dir(obj);
obj.src="assets/creation_1.jpeg";        //Main image modified

console.dir(document.getElementById("id")); //id absent in document, so returns null value

let obj2=document.getElementsByClassName("oldImg");
console.dir(obj2);
for(let i=0;i<obj2.length;i++){
    console.dir(obj2[i].src);       //old path
    obj2[i].src="assets/spiderman_img.png"      //path modified
}

console.dir(document.getElementsByClassName("abc"));    //empty collection

let obj3=document.getElementsByTagName("p");
console.dir(obj3);



//Query Selectors

console.dir(document.querySelector("p"));      //Selects first occurence of p element
console.dir(document.querySelector("#description"));    //by id name
console.dir(document.querySelector(".oldImg"));         //by class name

console.dir(document.querySelectorAll("p"));       //Selects all occurences of p

console.dir(document.querySelectorAll("*"));        //Selects all occurences


console.dir(document.querySelector("div a"));
console.dir(document.querySelectorAll("div a"));

console.dir(document.querySelector("div"));
console.dir(document.querySelectorAll("div"));

let para=document.querySelector("p");

//DOM Manipulation

para.innerText="Hi, I am <b> Peter Parker </b>";
console.log(para.innerText);
para.innerHTML="Hi, I am <b> Peter Parker </b>";
console.log(para.innerText);
console.log(para.textContent);


let heading=document.querySelector('h1');
heading.innerHTML=`<u>${heading.innerText}</u>`;
console.dir(heading.innerText);


//Manipulating Attributes
let img=document.querySelector('img');
console.log(img);
console.log(img.getAttribute('id'));
img.setAttribute('id','spidermanImg');
img.setAttribute('src','assets/spiderman_img.png');
console.log(img.getAttribute('class'));
img.setAttribute('class','main');

console.dir(obj2);
for(let i=0;i<obj2.length;i++){
    console.dir(obj2[i].src);       //old path
    obj2[i].src=`assets/creation_${i+1}.jpeg`;     //path modified
}


//Manipulating Style

heading.innerHTML="<u>Spider Man</u>"
console.dir(heading);
console.dir(heading.style);
heading.style.color='green';
