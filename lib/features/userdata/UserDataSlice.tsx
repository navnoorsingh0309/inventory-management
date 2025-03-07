import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserDataState {
  id: string
  firstName: string
  lastName: string
  email: string
  role: number;
}

const initialState: UserDataState = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: 0
}

export const UserDataSlice = createSlice({
  name: 'UserData',
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.lastName = action.payload
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setRole: (state, action: PayloadAction<number>) => {
      state.role = action.payload
    }
  }
})

export const { setId, setFirstName, setLastName, setEmail, setRole } = UserDataSlice.actions
export default UserDataSlice.reducer