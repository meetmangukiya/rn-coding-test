import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/AntDesign';
import React, {useRef} from 'react';
import {
  addShoppingListItem,
  deleteShoppingListItem,
  editShoppingListItem,
  useAppDispatch,
  useAppSelector,
} from './store';
import {nanoid} from 'nanoid/non-secure';

export interface IShoppingListItem {
  id: string;
  item: string;
  isCompleted: boolean;
}

const CompleteButton = ({onComplete}: {onComplete: () => void}) => {
  return (
    <TouchableOpacity style={{}} onPress={onComplete}>
      <Icon name="checkcircle" color="#00aced" size={20} />
    </TouchableOpacity>
  );
};

const DeleteButton = ({onDelete}: {onDelete: () => void}) => {
  return (
    <TouchableOpacity onPress={onDelete}>
      <Icon name="delete" color="#00aced" size={20} />
    </TouchableOpacity>
  );
};

export const ShoppingListItem = ({
  item,
  isCompleted,
  onDelete,
  id,
}: {
  item: string;
  isCompleted: boolean;
  id: string;
  onDelete: () => {};
}) => {
  const dispatch = useAppDispatch();
  const ref = useRef<SwipeRow<any>>();

  return (
    <SwipeRow
      rightOpenValue={-30}
      rightActionValue={-30}
      leftOpenValue={30}
      leftActionValue={30}
      ref={r => (ref.current = r)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          height: 40,
          padding: 3,
        }}>
        <Text>
          <CompleteButton
            onComplete={() => {
              dispatch(
                editShoppingListItem({
                  item,
                  id,
                  isCompleted: true,
                }),
              );
              ref.current.closeRow();
            }}
          />
        </Text>

        <Text>
          <DeleteButton onDelete={onDelete} />
        </Text>
      </View>

      <View
        style={{
          height: 40,
          backgroundColor: 'white',
          borderBottomColor: 'grey',
          padding: 10,
          borderBottomWidth: 0.2,
        }}>
        <Text
          style={{
            textDecorationLine: isCompleted ? 'line-through' : 'none',
          }}>
          {item}
        </Text>
      </View>
    </SwipeRow>
  );
};

const sortedShoppingList = (shoppingList: IShoppingListItem[]) => {
  const sorter = (a: IShoppingListItem, b: IShoppingListItem) =>
    a.item > b.item ? 1 : -1;
  const completedItems = shoppingList
    .filter(item => item.isCompleted)
    .sort(sorter);
  const incompleteItems = shoppingList
    .filter(item => !item.isCompleted)
    .sort(sorter);
  return [...incompleteItems, ...completedItems];
};

export const ShoppingList = () => {
  const shoppingList = useAppSelector(state => state.shoppingList);
  const dispatch = useAppDispatch();
  const textInputRef = useRef(null);
  const clearText = () => textInputRef.current.clear();

  return (
    <>
      <TextInput
        placeholder="Add a new item to the list..."
        ref={textInputRef}
        style={{
          margin: 10,
          paddingBottom: 3,
          borderBottomWidth: 0.5,
          borderBottomColor: 'grey',
        }}
        onSubmitEditing={e => {
          console.log('submitted', e.nativeEvent.text);
          const item = e.nativeEvent.text;
          if (item.trim().length > 0) {
            dispatch(
              addShoppingListItem({
                item: item.trim(),
                id: nanoid(),
                isCompleted: false,
              }),
            );
            clearText();
          }
        }}
      />
      <SwipeListView
        data={sortedShoppingList(shoppingList)}
        renderItem={data => (
          <ShoppingListItem
            {...data.item}
            onDelete={() => dispatch(deleteShoppingListItem(data.item))}
          />
        )}
        disableRightSwipe={true}
      />
    </>
  );
};
