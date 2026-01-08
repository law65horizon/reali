import React, { useState } from 'react';
import {
  Button,
  InputAccessoryView,
  Keyboard,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

const inputAccessoryViewID = 'uniqueID';
const initialText = '';

const InputFieldx = () => {
  const [text, setText] = useState(initialText);

  return (<>
    {/* // <SafeAreaProvider> */}
      {/* <SafeAreaView style={styles.container}> */}
        {/* <ScrollView keyboardDismissMode="interactive"> */}
          <TextInput
            style={styles.textInput}
            inputAccessoryViewID={inputAccessoryViewID}
            onChangeText={setText}
            value={text}
            placeholder={'Please type here…'}
            multiline
          />
        {/* </ScrollView> */}
      {/* // </SafeAreaView> */}
      <InputAccessoryView nativeID={inputAccessoryViewID} >
        <View style={{alignItems:'flex-end', paddingRight: 10}}>
          <Button onPress={() => Keyboard.dismiss()} title='Done' />
        </View>
      </InputAccessoryView>
    {/* // </SafeAreaProvider> */}
 </> );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'red'
  },
  textInput: {
    padding: 16,
    borderColor: 'black',
    borderWidth: 1,
  },
});

export default InputFieldx;