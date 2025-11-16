import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import CustomCheckbox from '../components/CustomCheckbox';
import FocusFlowLogo from '../assets/images/logo.png';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        if (!agreedToTerms) {
            Alert.alert('Erro', 'Você deve aceitar os Termos e Condições.');
            return;
        }

        setLoading(true);

        register(email, password)
            .then((userCredential) => {
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert('Erro', 'Este e-mail já está em uso.');
                } else if (error.code === 'auth/invalid-email') {
                    Alert.alert('Erro', 'O formato do e-mail é inválido.');
                } else {
                    Alert.alert('Erro', 'Ocorreu um erro ao criar sua conta.');
                }
                console.error('Erro de cadastro:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Botão de Voltar */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#555" />
            </TouchableOpacity>

            <Image source={FocusFlowLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Crie sua conta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                placeholderTextColor="#999"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
            />
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            {/* Termos e Condições */}
            <View style={styles.termsContainer}>
                <CustomCheckbox
                    label="Eu aceito os Termos e Condições"
                    isChecked={agreedToTerms}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                />
            </View>

            {/* Botão de Cadastrar */}
            <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
            >
                <LinearGradient
                    colors={['#8C4DD5', '#3CB0E1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, loading && styles.buttonDisabled]}
                >
                    <Text style={styles.registerButtonText}>
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Link para Login */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Já tem uma conta? <Text style={styles.loginLink}>Faça login</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F7F9FC',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    termsContainer: {
        width: '100%',
        marginVertical: 15,
    },
    registerButton: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    gradient: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#8C4DD5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginText: {
        color: '#555',
        fontSize: 14,
    },
    loginLink: {
        color: '#3CB0E1',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;