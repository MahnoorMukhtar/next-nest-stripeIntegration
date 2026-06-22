import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CourseItem {
    courseId: string,
    courseName: string,
    price: number
}

interface CartState {
    items: CourseItem[]
}

const initialState: CartState = {
    items: []
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CourseItem>) => {
            const exist = state.items.find(item=>item.courseId==action.payload.courseId)
            if(!exist){
                state.items.push(action.payload)
            }
        },
        removeFromCart: (state, action: PayloadAction<string>)=>{
            state.items = state.items.filter(item => item.courseId !== action.payload)
        },
        cleartCart: (state)=>{
            state.items = []
        } 
    }
})

export const { addToCart, removeFromCart, cleartCart } = cartSlice.actions
export default cartSlice.reducer;