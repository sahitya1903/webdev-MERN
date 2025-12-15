let form=document.querySelector("form");

form.addEventListener("submit",function(event){
    event.preventDefault();
    // alert("Form Submitted");
    // let input=document.querySelector('input');
    // console.dir(input);
    // console.log(input.value);

    // let user=document.querySelector('#user');
    // let pass=document.querySelector('#pass');

    console.dir(form);
    console.log(form.elements);
    
    let user=this.elements[0];
    let pass=this.elements[1];

    console.log(user.value);
    console.log(pass.value);
    alert(`Hi, ${user.value}! Your password is set to ${pass.value}.`);

});