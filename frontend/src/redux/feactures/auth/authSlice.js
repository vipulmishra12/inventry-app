import { createSlice } from '@reduxjs/toolkit';

const name = JSON.parse(localStorage.getItem("name"))

// const loadName = () => {
//     try {
//         const serializedName = localStorage.getItem("name");
//         if (serializedName === null) {
//             return "";
//         }
//         return JSON.parse(serializedName);
//     } catch (error) {
//         console.error("Failed to load name from localStorage:", error);
//         return "";
//     }
// }

const initialState = {
    isloggedIn: false,
    name: name ? name : "",
    user: {
        name: "",
        email: "",
        phone: "",
        bio: "",
        photo: "",

    },

}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        //actions

        SET_LOGIN(state, action) {
            state.isloggedIn = action.payload
        },
        // SET_NAME(state, action) {
        //     const name = action.payload;
        
        //     if (name !== undefined && name !== null) {
        //         // Store valid name in localStorage
        //         localStorage.setItem("name", JSON.stringify(name));
        //         state.name = name;
        //     } else {
        //         // Remove the name from localStorage if invalid
        //         localStorage.removeItem("name");
        //         state.name = "";
        //     }
        // },
        
        SET_NAME(state, action) {
            //store name to local storege for later porposes 
            localStorage.setItem("name", JSON.stringify(action.payload))
            state.name = action.payload
        },  
        SET_USER(state, action) {
            const profile = action.payload;
            state.user.name = profile.name
            state.user.email = profile.email
            state.user.bio = profile.bio
            state.user.phone = profile.phone
            state.user.photo = profile.photo
        },
    },

})


//export actions
export const { SET_LOGIN, SET_NAME, SET_USER } = authSlice.actions;

//export state
export const selectIsLoggedIn = (state) => state.auth.isloggedIn
export const selectname = (state) => state.auth.name
export const selectuser = (state) => state.auth.user

export default authSlice.reducer;
