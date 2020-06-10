import React, { useState, useReducer, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Input } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';
import { validate } from './validators';

const inputReducer = (state, action) => 
{
    switch (action.type) 
    {
      case 'CHANGE':
        return {
          ...state,
          value: action.val,
          isValid: action.validators ? validate(action.val, action.validators) : true
        };
      case 'TOUCH': 
      {
        return {
          ...state,
          isTouched: true
        }
      }
      default:
        return state;
    }
};

const CustomInput = (props) =>
{
    // Validation
    const [inputState, dispatch] = useReducer(inputReducer, 
    {
        value: props.value ? props.value :'',
        isTouched: false,
        isValid: props.validity ? props.validity : false
    });
    
    const { id, onInput } = props;
    const { value, isValid } = inputState;
    
    useEffect(() => 
    {
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput]);

    const changeHandler = entryValue => 
    {
        dispatch({
            type: 'CHANGE',
            val: entryValue,
            validators: props.validators
        });
    };

    const touchHandler = () => 
    {
        dispatch
        ({
            type: 'TOUCH'
        });
    };

    // Password Case
    const [passwordSecure, setPasswordSecure] = useState(true);

    const togglePasswordIcon = () =>
    {
        return (
                <TouchableOpacity onPress={() => setPasswordSecure(!passwordSecure)}>
                    <Ionicons name={passwordSecure ? 'ios-eye-off' : 'ios-eye'} size={25} color={Colors.primary} />
                </TouchableOpacity>
        )
    }

    const element = props.type === 'password'
                    ? ( <Input id={props.id} style={styles.inputField} placeholder={props.placeholder} value={inputState.value} 
                                    onChangeText={changeHandler} onBlur={touchHandler} 
                                    secureTextEntry={passwordSecure} accessoryRight={() => togglePasswordIcon()} /> )

                    : ( <Input id={props.id} style={styles.inputField} placeholder={props.placeholder} value={inputState.value} 
                                    onChangeText={changeHandler} onBlur={touchHandler}  /> )

    // Returned Result
    return (
        <React.Fragment>
            {element}
            {!inputState.isValid && inputState.isTouched && <Text style={styles.error}>{props.errorText}</Text>}
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    inputField:
    {
        marginTop: '2%',
        elevation: 15,
        borderRadius: 15,
        borderColor: Colors.primary
    },
    error:
    {
        color: Colors.accent,
        marginLeft: '5%'
    }
})

export default CustomInput;