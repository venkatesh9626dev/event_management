import { getDatabase, ref,child, set , get} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import{createUserWithEmailAndPassword,onAuthStateChanged, signInWithEmailAndPassword , updateProfile} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { auth } from "./config.js";

const db = getDatabase();
 
      //   Dom Reference Variables //

      // pages reference

 export let signupPage = document.getElementById("signUpPage");
 export let loginPage = document.getElementById("signInPage");

// form reference

let upForm = document.getElementById("signupForm");
let inForm = document.getElementById("signinForm")


// signup elements reference//

let userNameSignup = document.getElementById("userNameSignUp");
let userMailSignup = document.getElementById("userMailSignUp");
let userPassSignup = document.getElementById("userPasswordSignUp");
let confirmPassSignup = document.getElementById("confirmPassSignUp");
let userDistSignup = document.getElementById("district");
let userInterestArrSignup = document.querySelectorAll(".interest");
let userSignupBtn = document.getElementById("signupBtn");

// login variables

let signinMail = document.getElementById("userMaillogin");
let signinPass = document.getElementById("userPasswordLogin");
let signinBtn = document.getElementById("loginBtn");

// login error

let inMailError = document.getElementById("UserMailErrorSignin");
let inPassError = document.getElementById("UserPassErrorSignin")
let commonError = document.getElementById("commonErrorSignin")
let errorPartIn = [inMailError,inPassError,commonError];

// signup errs variables

let userNameSignUpError = document.getElementById("UserNameError");
let UserMailErrorSignUp = document.getElementById("UserMailErrorSignUp")
let UserPassErrorSignUp = document.getElementById("UserPassErrorSignUp");
let UserConfirmPassErrorSignUp = document.getElementById("UserConfirmPassErrorSignUp")
let UserLocationErrorSignUp = document.getElementById("UserLocationErrorSignUp");
let UserInterestErrorSignUp = document.getElementById("UserInterestErrorSignUp");
let errorPart = [userNameSignUpError,UserMailErrorSignUp,UserPassErrorSignUp,UserConfirmPassErrorSignUp,UserLocationErrorSignUp,UserInterestErrorSignUp];

// redirect variables

let toLogin = document.getElementById("loginRedirect");
let toSignup = document.getElementById("signUpRedirect");

toLogin.addEventListener("click",()=>{
    errorPart.forEach((element)=>{
        element.textContent = "";
    })
    upForm.reset()
    localStorage.setItem("signedup",JSON.stringify(true)) // to trace current page
    signupPage.style.display = "none";
    loginPage.style.display = "block";
});
toSignup.addEventListener("click",()=>{
    errorPartIn.forEach((element)=>{
        element.textContent = "";
    })
    inForm.reset()
    userSignupBtn.innerHTML = "Create your Account";
    userSignupBtn.style.color = "white";
    localStorage.removeItem("signedup")
    signupPage.style.display = "block";
    loginPage.style.display = "none";
})

// userName Error Check

// userName function

async function userNameErrorCheck() {
    userNameSignUpError.textContent = "";
    userNameSignUpError.style.color = "red";
    let enteredValue = userNameSignup.value;
    let valueLen = enteredValue.length;
    


    
    if (valueLen === 0) {
        userNameSignUpError.textContent = "Enter Your Username";
        return 1;
    } 
    
    else if (!/^[a-zA-Z0-9_]*$/.test(enteredValue)) {
        userNameSignUpError.textContent = "The username only contains alphabets, numbers, and (_) underscore";
        return 1;
    } 
    else if (valueLen < 3) {
        userNameSignUpError.textContent = "Enter minimum 3 characters";
        return 1;
    }
    else {
        const userNameDbRef = ref(db,`users/usernames/${enteredValue}`);
      try{
        let snapshot = await get(userNameDbRef)
        
        if(snapshot.exists()){
            userNameSignUpError.textContent = "The username already exists"
            return 1;
        }
        else{
            userNameSignUpError.style.color = "green";
            userNameSignUpError.textContent = "Good Username"
            return 0;
        }
      }
      catch(error){
        userNameSignUpError.textContent = `${error}`
        return 1;
      }
       
    }
    
}
// Email function

function emailErrorCheck(email) {
    // Regular expression for basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    if (emailRegex.test(email)) {
        UserMailErrorSignUp.textContent = "valid email format";
        UserMailErrorSignUp.style.color = "green";
        return 0; // No error
    } else {
        UserMailErrorSignUp.textContent = "Invalid email format";
        UserMailErrorSignUp.style.color = "red";
        return 1; // Error found
    }
}

// password check function

function passErrorCheck(){
   

    let value = userPassSignup.value;
    UserPassErrorSignUp.style.color = "red";
    let caps = 0;
    let special = 0;
    let number = 0;

    if(value === ""){
        UserPassErrorSignUp.textContent = "";
    }
    else{
        for(let i = 0; i < value.length; i++){
            
            if(value.charCodeAt(i) >= 65 && value.charCodeAt(i) <=90 ){
                caps = 1;
            }
            else if((value.charCodeAt(i) >= 33 && value.charCodeAt(i) <=47) || (value.charCodeAt(i) >= 58 && value.charCodeAt(i) <=64) ||(value.charCodeAt(i) >= 91 && value.charCodeAt(i) <=96) || (value.charCodeAt(i) >= 123 && value.charCodeAt(i) <=125) ){
                special = 1;
            }
            else if(value.charCodeAt(i) >=48 && value.charCodeAt(i) <=57){
                number = 1;
            }
            else if(value.charCodeAt(i) === 32){
                UserPassErrorSignUp.textContent = "Space is a invalid character";
                return 1;
            }
        }
        let count = caps === 1 && special ===1 && number ===1;
        if(count && value.length >=8){
            UserPassErrorSignUp.textContent = "Password is Good";
            UserPassErrorSignUp.style.color = "green";
        }
        else if(count && value.length <8){
            UserPassErrorSignUp.textContent = "Password should contain 8 characters"
            return 1;
        }
        else if(count === false){
            UserPassErrorSignUp.textContent = "Password is Poor";
            return 1;
        }
    }
    
    return 0;
}

// Confirm password error check

function confirmPassErrorCheck(){
    
    UserConfirmPassErrorSignUp.textContent = "";
    UserConfirmPassErrorSignUp.style.color = "red";
    let passValue = userPassSignup.value;
    let inputValue = confirmPassSignup.value;

    if(passValue === inputValue){
        UserConfirmPassErrorSignUp.textContent ="Password matched"
        UserConfirmPassErrorSignUp.style.color = "green";
    }
    else if(inputValue.length > passValue.length){
        UserConfirmPassErrorSignUp.textContent = "Password is too length";
        return 1;
    }
    else{
        for(let i = 0; i < inputValue.length; i++){
            if(inputValue[i] !== passValue[i]){
                UserConfirmPassErrorSignUp.textContent = "Password Mismatch"
                return 1;
                
            }
        }
    }
    return 0;
}

userNameSignup.addEventListener("input", userNameErrorCheck);

userMailSignup.addEventListener("focus",()=>{
    if(userNameSignup.value === ""){
        userNameSignUpError.textContent = "Enter your username"
    }
})

userMailSignup.addEventListener("input",()=>{
    emailErrorCheck(userMailSignup.value);
});

// Password Test cases
userPassSignup.addEventListener("focus",()=>{
    if(userMailSignup.value === ""){
        UserMailErrorSignUp.textContent = "Enter your email address"
    }
})
userPassSignup.addEventListener("input",passErrorCheck);


// Confirm Password

confirmPassSignup.addEventListener("focus",()=>{
    if(userPassSignup.value === ""){
        UserPassErrorSignUp.textContent = "First enter your password"
    }
})

confirmPassSignup.addEventListener("input",confirmPassErrorCheck);

// signup functions

userSignupBtn.addEventListener("click",async ()=>{

    let errorPart = [userNameSignUpError,UserMailErrorSignUp,UserPassErrorSignUp,UserConfirmPassErrorSignUp,UserLocationErrorSignUp];
    for(let i = 0; i <errorPart.length;i++){
        errorPart[i].textContent = "";
    }

    let countError = 0;

    let userNameValue = userNameSignup.value;
    let userMailValue = userMailSignup.value;
    let passwordValue = userPassSignup.value;
    let confirmValue = confirmPassSignup.value;
    
    let locationValue = userDistSignup.value;
    
    let interestArr = [];

    let errorName = ["Username","email address","Password","Confirm Password","or select location"];
    let checkValue = [userNameValue,userMailValue,passwordValue,confirmValue,locationValue,interestArr];
    let respectiveFtn = [userNameErrorCheck,emailErrorCheck,passErrorCheck,confirmPassErrorCheck,zero,interestFtn]
    for(let i = 0; i <checkValue.length; i++){
        if(checkValue[i] === ""){
            errorPart[i].textContent = `Please fill ${errorName[i]} field`;
            countError++;
        }
        else{
            countError+= await respectiveFtn[i](checkValue[i]);
        }
    }
    

    if(countError === 0){
        signUpAuth(userNameValue,userMailValue,passwordValue,locationValue,interestArr);
    }

})
function zero(){
    return 0;
}
function interestFtn(interestArr){
    let count = 0;
    userInterestArrSignup.forEach((element,index)=>{
        if(element.checked){
            count++;
            interestArr.push(element.value);
        }
    })
    if(count === 0){
        UserInterestErrorSignUp.textContent = "Choose atleast one"
        return 1;
    }
    else{
        return 0;
    }
}


function signUpAuth(userNameValue,userMailValue,passwordValue,locationValue,interestValue){
    userSignupBtn.innerHTML = 'Signing up <i class="fa fa-spinner fa-spin" "></i>';
   
    createUserWithEmailAndPassword(auth, userMailValue, passwordValue)
    .then(async(userCredential) => {
        
        const user = userCredential.user;

        await updateProfile(
                user,{
                    displayName : userNameSignup.value
                }
            )
        // storing username in database
        const usernameRef = ref(db,`users/usernames/`);
        await set(usernameRef,{ [userNameValue]: userNameValue })

        // storing users personal details
        
        const userId = userCredential.user.uid;
        const dfRef = ref(db,`users/userDetails/${userId}/profileDetails`);

        return set(dfRef,{
                userName : `${userNameValue}`,
                userMail : `${userMailValue}`,
                userLocation : `${locationValue}`,
                userInterest : interestValue

            })
        
    })
    .then(async ()=>{
        
        userSignupBtn.innerHTML = "Login Succcesfull"
        setTimeout(()=>{
            redirectToLogin();
        },1000)
        
    })
    .catch((error)=>{
        
        if(error.code === 'auth/email-already-in-use'){
            UserMailErrorSignUp.style.color = "red";
            UserMailErrorSignUp.textContent = "Email already exists"
            userSignupBtn.innerHTML = "Create your account"
        }
    })

 
}

function redirectToLogin(){
    upForm.reset();
    errorPart.forEach((element)=>{
        element.textContent = "";
        element.style.color = "red";
    })
    userSignupBtn.innerHTML = 'Create your account';
    
    signupPage.style.display = "none";
    loginPage.style.display = "block"
}

// signnin Fucntions 


function inEmailCheck(email) {
    // Regular expression for basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    if (emailRegex.test(email)) {
        inMailError.textContent = "valid email format";
        inMailError.style.color = "green";
        return 0; // No error
    } else {
        inMailError.textContent = "Invalid email format";
        inMailError.style.color = "red";
        return 1; // Error found
    }
}

// password check function

function inPassCheck(value){
   

    
    UserPassErrorSignUp.style.color = "red";
    let caps = 0;
    let special = 0;
    let number = 0;

    if(value === ""){
        inPassError.textContent = "";
    }
    else{
        for(let i = 0; i < value.length; i++){
            
            if(value.charCodeAt(i) >= 65 && value.charCodeAt(i) <=90 ){
                caps = 1;
            }
            else if((value.charCodeAt(i) >= 33 && value.charCodeAt(i) <=47) || (value.charCodeAt(i) >= 58 && value.charCodeAt(i) <=64) ||(value.charCodeAt(i) >= 91 && value.charCodeAt(i) <=96) || (value.charCodeAt(i) >= 123 && value.charCodeAt(i) <=125) ){
                special = 1;
            }
            else if(value.charCodeAt(i) >=48 && value.charCodeAt(i) <=57){
                number = 1;
            }
            else if(value.charCodeAt(i) === 32){
                inPassError.textContent = "Space is a invalid character";
                return 1;
            }
        }
        let count = caps === 1 && special ===1 && number ===1;
        if(count && value.length >=8){
            inPassError.textContent = "Password is Good";
            inPassError.style.color = "green";
        }
        else if(count && value.length <8){
            inPassError.textContent = "Password should contain 8 characters"
            return 1;
        }
        else if(count === false){
            inPassError.textContent = "Password is Poor";
            return 1;
        }
       
    }
    
    return 0;
}

// signin from firebase

function signInFtn(mail,password){
    signinBtn.innerHTML = `Logging in <i class="fa fa-spinner fa-spin" "></i>`
    signInWithEmailAndPassword(auth,mail,password)
    .then(()=>{
        
        signinBtn.innerHTML = "Login to your account"
        inForm.reset();
        inMailError.textContent= "";
        inMailError.style.color = "red"
        inPassError.textContent = "";
        inMailError.style.color = "red";
        window.location.href = "../pages/dashboard.html";
    })
    .catch(()=>{
        commonError.textContent = "Invalid email or password"
        signinBtn.innerHTML = "Login to your account"
    })
}

signinMail.addEventListener("input",()=>{
    inEmailCheck(signinMail.value)
});
signinPass.addEventListener("input",()=>{
    inPassCheck(signinPass.value)
});

signinBtn.addEventListener("click",signInCheck);

async function signInCheck(){

    let errorCount = 0

    let errorPart = [inMailError,inPassError];
    let errorName = ["email address","Password"];
    let checkValue = [signinMail.value,signinPass.value];
    let respectiveFtn = [inEmailCheck,inPassCheck]
    for(let i = 0; i <checkValue.length; i++){
        if(checkValue[i] === ""){
            errorPart[i].textContent = `Please fill ${errorName[i]} field`;
            errorCount++;
        }
        else{
            errorCount+=  respectiveFtn[i](checkValue[i]);
        }
    }

    if(errorCount===0){
        signInFtn(signinMail.value,signinPass.value);
    }
}



