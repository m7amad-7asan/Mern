import React, { useReducer, useCallback } from 'react';
import { Text, View, StyleSheet, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';

import * as authActions from '../../store/actions/authActions';

import Colors from '../../constants/Colors';
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH, VALIDATOR_EMAIL } from '../../components/validators';
import Input from '../../components/Input';
import MainButton from '../../components/MainButton';

const formReducer = (state, action) => 
{
    switch (action.type) 
    {
      case 'INPUT_CHANGE':
        let formIsValid = true;
        for (const inputId in state.inputs) 
        {
          if (inputId === action.inputId) 
          {
            formIsValid = formIsValid && action.isValid;
          } 
          else 
          {
            formIsValid = formIsValid && state.inputs[inputId].isValid;
          }
        }
        return {
          ...state,
          inputs: 
          {
            ...state.inputs,
            [action.inputId]: { value: action.value, isValid: action.isValid }
          },
          isValid: formIsValid
        };
      default:
        return state;
    }
};

const Login = props =>
{
    const dispatch = useDispatch();

    const [formState, formDispatch] = useReducer(formReducer,
    {
        inputs: 
        {
            email: 
            {
                value: '',
                isValid: false
            },
            password: 
            {
                value: '',
                isValid: false
            }
        },
        isValid: false
    });
    
    const inputHandler = useCallback((id, value, isValid) => 
    {
        formDispatch({
            type: 'INPUT_CHANGE',
            value: value,
            isValid: isValid,
            inputId: id
        });
    }, []);

    const loginHandler = async () =>
    {
        if(formState.isValid)
        {
            try
            {
                await dispatch(authActions.login(formState.inputs.email.value, formState.inputs.password.value))
                props.navigation.replace('App', {screen: 'Home'})
            }
            catch(err)
            {
                Alert.alert('Wrong !!', err.message, [{text: 'OK'}])
            }
        }
        else
        {
            Alert.alert('Invalid Credentials', 'Please Check Your Credentials', [{text: 'OK'}])
        }
    }

    return (
        <ScrollView>
            <KeyboardAvoidingView style={{flex: 1}} behavior='padding' keyboardVerticalOffset={20} enabled>

                <View style={{alignItems: 'center'}}>

                    <View style={{marginTop: '15%'}}>
                        <Text style={styles.title}>Login To Your Account</Text>
                    </View>

                    <View style={styles.inputContainer}>

                        <Input id='email' placeholder='Email' login={true}
                                validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]} errorText='Email Required' onInput={inputHandler} />

                        <Input id='password' type='password' placeholder='Password' login={true}
                                validators={[VALIDATOR_REQUIRE()]} errorText='Password Is Required' onInput={inputHandler}/>

                        <View style={{marginTop: '10%'}}>
                            <MainButton onPress={loginHandler}>Login</MainButton>
                        </View>

                    </View>

                    <View style={{alignItems: 'center', marginTop: '5%'}}>
                        <Text style={styles.normalText}>Don't Have An Account ? </Text>
                        <MainButton style={{marginTop: '4%', backgroundColor: Colors.secondary}} 
                                onPress={() => props.navigation.replace('Auth', { screen: 'Signup' })}>Create Account</MainButton>
                    </View>

                </View>

            </KeyboardAvoidingView>
        </ScrollView>
    )
}

const styles = StyleSheet.create
({
    title:
    {
        fontSize:25,
        color: Colors.primary,
        fontFamily: 'raleway-bold'
    },  
    inputContainer:
    {
        marginTop: '10%',
        marginBottom: '10%',
        width: '80%'
    },
    normalText:
    {
        color: Colors.secondary,
        fontFamily: 'raleway-bold'
    }
})

export default Login;