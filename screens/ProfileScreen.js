import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { currentUser, logout, auth } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); 

    const [loading, setLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false); 
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || 'Usuário');
            setEmail(currentUser.email || 'email@exemplo.com');
        }
    }, [currentUser]);

    const handleUpdateDisplayName = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            if (displayName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName: displayName });
                Alert.alert('Sucesso', 'Nome de exibição atualizado!');
                setIsEditingName(false);
            }
        } catch (error) {
            console.error("Erro ao atualizar nome de exibição:", error);
            Alert.alert('Erro', 'Não foi possível atualizar o nome de exibição.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!currentUser || !currentPassword || !email) {
            Alert.alert('Atenção', 'Preencha o e-mail e sua senha atual para continuar.');
            return;
        }

        if (email === currentUser.email) {
            Alert.alert('Atenção', 'O novo e-mail é o mesmo que o atual.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updateEmail(currentUser, email);
            Alert.alert('Sucesso', 'E-mail atualizado!');
            setIsEditingEmail(false);
            setCurrentPassword('');
        } catch (error) {
            console.error("Erro ao atualizar e-mail:", error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Erro', 'Por favor, faça login novamente para atualizar seu e-mail.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Erro', 'O formato do e-mail é inválido.');
            } else if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Erro', 'Este e-mail já está em uso por outra conta.');
            } else if (error.code === 'auth/wrong-password') {
                Alert.alert('Erro', 'A senha atual está incorreta.');
            } else {
                Alert.alert('Erro', `Não foi possível atualizar o e-mail: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentUser || !currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Atenção', 'Preencha todos os campos de senha.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Erro', 'As novas senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            Alert.alert('Sucesso', 'Senha atualizada!');
            setIsEditingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error("Erro ao atualizar senha:", error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Erro', 'Por favor, faça login novamente para atualizar sua senha.');
            } else if (error.code === 'auth/wrong-password') {
                Alert.alert('Erro', 'A senha atual está incorreta.');
            } else {
                Alert.alert('Erro', `Não foi possível atualizar a senha: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: async () => {
                    setLoading(true);
                    try {
                        await logout();
                        navigation.replace('Login');
                    } catch (error) {
                        console.error("Erro ao fazer logout:", error);
                        Alert.alert('Erro', 'Não foi possível fazer logout.');
                    } finally {
                        setLoading(false);
                    }
                }},
            ],
            { cancelable: false }
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Excluir Conta',
            'ATENÇÃO: Esta ação é irreversível. Todas as suas tarefas e dados serão permanentemente excluídos. Tem certeza que deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => Alert.alert(
                        'Confirmação Final',
                        'Você realmente deseja excluir sua conta? Esta é a última chance de cancelar.',
                        [
                            { text: 'Não, cancelar', style: 'cancel' },
                            {
                                text: 'Sim, excluir permanentemente',
                                style: 'destructive',
                                onPress: async () => {
                                    console.log("LOG: Lógica de exclusão de conta precisa ser implementada.");
                                    Alert.alert('Aviso', 'A lógica de exclusão de conta ainda não foi implementada completamente. Requer reautenticação e exclusão de dados do Firestore.');
                                }
                            }
                        ]
                    )
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.fullScreenContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Imagem de Perfil e Nome/Email */}
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatar}>
                        <Feather name="user" size={80} color="#8C4DD5" />
                    </View>
                    <Text style={styles.profileName}>{currentUser?.displayName || 'Nome do Usuário'}</Text>
                    <Text style={styles.profileEmail}>{currentUser?.email || 'email@exemplo.com'}</Text>
                </View>

                {/* Seção Dados Pessoais */}
                <Text style={styles.sectionHeading}>Dados pessoais</Text>
                <View style={styles.card}>
                    {isEditingName ? (
                        <View style={styles.editFieldContainer}>
                            <TextInput
                                style={styles.inputField}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Seu nome"
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => { setIsEditingName(false); setDisplayName(currentUser.displayName); }}>
                                    <Text style={styles.actionButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleUpdateDisplayName} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Salvar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>{currentUser?.displayName || 'Nome Completo'}</Text>
                            <TouchableOpacity onPress={() => setIsEditingName(true)}>
                                <Text style={styles.actionLink}>Alterar nome</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.separator} />

                    {isEditingEmail ? (
                         <View style={styles.editFieldContainer}>
                            <TextInput
                                style={styles.inputField}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="Novo e-mail"
                            />
                            <TextInput
                                style={styles.inputField}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                placeholder="Sua senha atual"
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => { setIsEditingEmail(false); setCurrentPassword(''); setEmail(currentUser.email); }}>
                                    <Text style={styles.actionButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleUpdateEmail} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Salvar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>{currentUser?.email || 'email@exemplo.com'}</Text>
                            <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                                <Text style={styles.actionLink}>Alterar e-mail</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.separator} />

                    {isEditingPassword ? (
                         <View style={styles.editFieldContainer}>
                            <TextInput
                                style={styles.inputField}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                placeholder="Senha atual"
                            />
                            <TextInput
                                style={styles.inputField}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="Nova senha (min. 6 caracteres)"
                            />
                            <TextInput
                                style={styles.inputField}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry
                                placeholder="Confirme a nova senha"
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => { setIsEditingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>
                                    <Text style={styles.actionButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleUpdatePassword} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Salvar</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>**********</Text>
                            <TouchableOpacity onPress={() => setIsEditingPassword(true)}>
                                <Text style={styles.actionLink}>Alterar senha</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Seção Preferências */}
                <Text style={styles.sectionHeading}>Preferências</Text>
                <View style={styles.card}>
                    <View style={styles.preferenceRow}>
                        <Text style={styles.infoText}>Notificações</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={notificationsEnabled ? "#8C4DD5" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setNotificationsEnabled}
                            value={notificationsEnabled}
                        />
                    </View>
                </View>

                {/* Botões de Ação Final */}
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity style={[styles.bottomButton, styles.logoutButton]} onPress={handleLogout} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.bottomButtonText}>Sair</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bottomButton, styles.deleteAccountButton]} onPress={handleDeleteAccount} disabled={loading}>
                        <Text style={styles.bottomButtonText}>Excluir conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        paddingBottom: 100, 
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E0D0F0', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#8C4DD5',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: '#777',
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    actionLink: {
        fontSize: 14,
        color: '#8C4DD5',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 5,
    },
    preferenceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    editFieldContainer: {
        paddingVertical: 10,
    },
    inputField: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 10,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#8C4DD5',
    },
    cancelButton: {
        backgroundColor: '#AAA',
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    bottomButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    bottomButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#E74C3C', 
    },
    deleteAccountButton: {
        backgroundColor: '#95A5A6', 
    },
});

export default ProfileScreen;