import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserDataState {
  id: string
  firstName: string
  lastName: string
  email: string
}

const initialState: UserDataState = {
    id: "",
    firstName: "",
    lastName: "",
    email: ""
}

export const UserDataSlice = createSlice({
  name: 'UserData',
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    }
  }
})

export const { setId } = UserDataSlice.actions
export default UserDataSlice.reducer