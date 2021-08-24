import {IShoppingListItem} from './ShoppingList';
import {combineReducers} from 'redux';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
// import './firebase';
import firestore, {firebase} from '@react-native-firebase/firestore';

export const ADD_SHOPPING_LIST_ITEM = 'ADD_SHOPPING_LIST_ITEM';
export const DELETE_SHOPPING_LIST_ITEM = 'DELETE_SHOPPING_LIST_ITEM';
export const EDIT_SHOPPING_LIST_ITEM = 'EDIT_SHOPPING_LIST_ITEM';
export const UPDATE_STATE = 'UPDATE_STATE';

interface IReducerAction {
  type: string;
  payload: any;
}

// ==================================== actions
export const addShoppingListItem = (
  item: IShoppingListItem,
): IReducerAction => ({
  type: ADD_SHOPPING_LIST_ITEM,
  payload: item,
});

export const deleteShoppingListItem = (
  item: IShoppingListItem,
): IReducerAction => ({
  type: DELETE_SHOPPING_LIST_ITEM,
  payload: item,
});

export const editShoppingListItem = (
  item: IShoppingListItem,
): IReducerAction => ({
  type: EDIT_SHOPPING_LIST_ITEM,
  payload: item,
});

export const updateState = (data): IReducerAction => {
  console.log({data});
  return {
    type: UPDATE_STATE,
    payload: data || [],
  };
};

// ==================================== reducers

const initialState: {shoppingList: IShoppingListItem[]} = {
  shoppingList: [],
};

const shoppingListReducer = (
  state: IShoppingListItem[] = [],
  action: IReducerAction,
) => {
  switch (action.type) {
    case ADD_SHOPPING_LIST_ITEM:
      const newState = [...state, action.payload as IShoppingListItem];
      updateFirestore(newState);
      return newState;
    case DELETE_SHOPPING_LIST_ITEM: {
      const newShoppingList = [...state];
      const found = newShoppingList.findIndex(
        item => item.id === action.payload.id,
      );
      newShoppingList.splice(found, 1);
      updateFirestore(newShoppingList);
      return newShoppingList;
    }
    case EDIT_SHOPPING_LIST_ITEM: {
      const newShoppingList = [...state];
      const found = newShoppingList.findIndex(
        item => item.id === action.payload.id,
      );
      newShoppingList[found] = {...newShoppingList[found], ...action.payload};
      updateFirestore(newShoppingList);
      return newShoppingList;
    }
    case UPDATE_STATE: {
      return action.payload || [];
    }
    default: {
      return [...state];
    }
  }
};

const store = configureStore({
  reducer: combineReducers({
    shoppingList: shoppingListReducer,
  }),
  preloadedState: initialState,
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const updateFirestore = (shoppingList: IShoppingListItem[]) => {
  firestore().collection('globals').doc('state').set({shoppingList});
};

firestore()
  .collection('globals')
  .doc('state')
  .get()
  .then(doc => store.dispatch(updateState(doc.data().shoppingList)));

firestore()
  .collection('globals')
  .doc('state')
  .onSnapshot(doc => {
    store.dispatch(updateState(doc.data().shoppingList));
  });

// store.subscribe(() => {
//   const state = store.getState();
//   firestore().collection('globals').doc('state').set(state);
//   // firebaseApp.database().ref('global/state').set(state);
// });
