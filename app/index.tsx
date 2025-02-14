import React, {useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import{construirUrl} from '@/assets/padroes/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import { Picker} from '@react-native-picker/picker';

export default function App() {  
  const [loadingTela, setLoadingTela] = useState(true);  
  const [editStates, setEditStates] = useState({});
  const [inputValue, setInputValue] = useState(); // Valor do input
  const [loadingTrampo, setLoadingTrampo] = useState(true);  
  const [dadosTrampo, setDadosTrampo] = useState([]);  
  const [loadingTransacao, setLoadingTransacao] = useState(true);  
  const [dadosTransacao, setDadosTransacao] = useState([]);  
  const [loadingTotais, setLoadingTotais] = useState(true);  
  const [dadosTotais, setDadosTotais] = useState([]);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);  
  const [idValoreModalVisible, valoreModalVisible] = useState(false);
  const [formTransacao, setFormTransacao] = useState({
    nome_trampo: '',
    valor: '',
  })
  const [formTrampo, setFormTrampo] = useState({
    nome: '',
  });


  const SubmitTrampo = async (e) => {

    e.preventDefault();
    try {
      if (formTrampo.nome != "" ){
        const response = await axios.post(construirUrl('addtrampo'), formTrampo);        
        toggleProfileModal();
        setFormTrampo({ nome: '' }); // Reseta o formulário
        setLoadingTransacao(true)      
        setLoadingTotais(true);     
        setLoadingTrampo(true); 
        buscar_dados();
      }
      else{
        alert('Adicione um nome !');
      }       
    } catch (error) {
      console.error('Erro ao adicionar trampo:', error);
    }
  };
  

  // Envio do formulário de transação
  const SubmitTransacao = async (e) => {
    e.preventDefault();
    try {
      if (formTransacao.nome_trampo != "" && formTransacao.valor != ""){
        const response = await axios.post(construirUrl('addtransacao'), formTransacao);        
        valoresModal();
        setFormTransacao({ nome_trampo: '', valor: '' }); // Reseta o formulário
        setLoadingTransacao(true)      
        setLoadingTotais(true);     
        setLoadingTrampo(true); 
        buscar_dados();
      }
      else{
        alert('Adicione Todos os dados !');
      }      
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
  };

  const UpdateTransacao = async (id, fnome, fvalor) => {  
    try {
      // Evita enviar valores vazios
      const dadosAtualizados = {
        nome_trampo: formTransacao.nome_trampo || fnome, // Se estiver vazio, usa fnome
        valor: formTransacao.valor || fvalor, // Se estiver vazio, usa fvalor
      };
  
      // Envia os dados para o backend
      const response = await axios.put(construirUrl(`updatetransacao/${id}`), dadosAtualizados);
      
      // Caso a atualização tenha sido bem-sucedida
      
      alert('Dados salvos!');
  
      setFormTransacao({ nome_trampo: '', valor: '' }); // Limpa o formulário
      setLoadingTransacao(true);   
      setLoadingTotais(true);   
      buscar_dados(); // Recarrega os dados após a atualização
  
    } catch (error) {
      console.error('Erro ao atualizar a transação:', error);
    }
  };
  

  const buscar_dados = async () =>{
     

    if (loadingTrampo == true){
      try{
        const response = await axios.get(construirUrl('trampo')) ;
        setDadosTrampo([...response.data]);           
        setLoadingTrampo(false); 
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    if (loadingTransacao == true){
      try{
        const response = await axios.get(construirUrl('transacao')) ;
        setDadosTransacao([...response.data]);           
        setLoadingTransacao(false); 
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    if (loadingTotais == true){
      try{
        const response = await axios.get(construirUrl(`totais/${new Date().getMonth() + 1}/${new Date().getFullYear()}`)) ;
        setDadosTotais([...response.data]);           
        setLoadingTotais(false); 
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    
    
  };

  useEffect(() => {
    buscar_dados();
  });

  useEffect(() => {
    CarregarTela();
  }, []);

  const toggleEdit = (id) => {
    setEditStates((prevStates) => ({
      ...prevStates,
      [id]: !prevStates[id], // Inverte o estado de edição do item com o ID especificado
    }));
  };

  
  const toggleProfileModal = () => setProfileModalVisible(!isProfileModalVisible);  
  const valoresModal = () => valoreModalVisible(!idValoreModalVisible);    
  const CarregarTela = async ()  => { await new Promise((resolve) => setTimeout(resolve, 3000)); setLoadingTela(!loadingTela);}


    const cards = ({ item }) => (
      <View style={[
        styles.card, 
        {
          backgroundColor: item.total > 0 ? '#5fe13c' : '#ff0000e3',
          borderColor:  item.total_hj > 0 ? '#5fe13c' : '#ff0000e3',
        },
      ]}
  >        
        <Text style={styles.subtitle}>{item.nome}</Text>
        <Text style={styles.balanceText}>R$ {item.total}</Text>
        <Text style={styles.subtitle}>Entrou hoje R$ {item.total_hj}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    );
    const contas = ({ item, index }) => {
      const isLastItem = index === dadosTrampo.length - 1; // Verifica se é o último item
  
      return (<>
      
        <View key={`${item.nome}_${index}`} style={styles.features}>
          <TouchableOpacity style={styles.featureButton}>
          <Ionicons
                name={
                  item.nome === 'Facebook'
                    ? 'logo-facebook' 
                    : item.nome === 'Documentos'
                    ? 'card'
                    : item.nome === 'Freelancer'
                    ? 'desktop'
                    : item.nome === 'Puxadas'
                    ? 'search' 
                    : 'cash'
                }
                size={24}
                color="#ccc"
              />
            <Text style={styles.featureText}>{item.nome}</Text>
          </TouchableOpacity>
        
        </View>
        {isLastItem && (
          <View style={styles.features}>

                <TouchableOpacity onPress={toggleProfileModal}>
                  <View style={{alignItems: 'center', justifyContent:'center'}}>
                    <Ionicons  name="add" size={40} color="#fff" />
                    
                  </View>
                
                </TouchableOpacity>

            </View> 
        )}</>
    );
  };
    const valores = ({ item }) => {
      const isEditable = editStates[item.id] || false;
      return (
      <View style={styles.cardvalue}>
      <View style={styles.inputsvalores}>  

      
        <View style={styles.inputSection}> 

        {isEditable ? (
        <Picker
          style={styles.picker}
          onValueChange={(value) => {
            // Atualiza apenas o campo 'nome_trampo' do estado formTransacao
            setFormTransacao((prevForm) => ({
              ...prevForm,
              nome_trampo: value, // Atualiza o valor de 'nome_trampo' com o selecionado no Picker
            }));
          }}
        >
        {dadosTrampo.map((contas) => (
          <Picker.Item 
            key={contas.id}   
            color="black" 
            label={contas.nome} // Exibe o nome da conta como label
            value={contas.nome} // O valor associado será 'contas.nome'
          />
        ))}
      </Picker> 
        
      ) : (
        <Picker
          style={styles.picker}
          selectedValue={item.nome} // valor selecionado será 'item.nome'
        >
          {dadosTrampo.map((contas) => (
            <Picker.Item
              key={contas.id} // Certifique-se de que cada item possui um id único
              color="black"
              label={contas.nome} // Exibe o nome da conta como label
              value={contas.nome} // O valor associado será 'contas.nome'
            />
          ))}
        </Picker>
      )} 


        </View>   

      <View style={styles.inputSection}>
        <TextInput
          style={[styles.input, 
            {
              color: item.valor > 0 ? '#36ff00e3' : '#ff0000e3',
            },
          ]}
          editable={isEditable}
          placeholder={item.valor}          
          placeholderTextColor={item.valor > 0 ? '#36ff00e3' : '#ff0000e3'}
          keyboardType="numeric"
          onChangeText={(value) => {
            // Atualiza o valor no estado 'formTransacao'
            setFormTransacao((prevState) => ({
              ...prevState,
              valor: value, // Atualiza o campo 'valor' com o texto digitado
            }));
          }}
        
        />
        <View>
          <Text style={styles.datavalue}>{item.dia}</Text>

        </View>
        
      </View>
      
      </View>
      
      {/* Botões */}       
          <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
                  styles.editButton,
                  { backgroundColor: isEditable ? 'red' : '#5facff' },
                ]}
            onPress={() => toggleEdit(item.id)} // Alterna o modo de edição para este item
              >
                <Text style={styles.editButtonText}>
                  {isEditable ? 'Cancelar' : 'Editar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: isEditable ? '#5fe643c2' : '#ccc' },
                ]}
                disabled={!isEditable} // Botão desativado até o modo "Editar" estar ativo
                onPress={() => {
                  UpdateTransacao(item.id, item.nome, item.valor)
                  toggleEdit(item.id); // Desativa o modo de edição após salvar
                }}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
      );};


  if (loadingTela) {
    
    return <> 
       <View  
       style={{
            flex: 1,
            backgroundColor:'#161616',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
       <ActivityIndicator size="large" color="#307E89" />  
       </View> 
        </>;
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
      <View style={styles.topfixo}>


      {/* Top Bar */}
      <View style={styles.topBar}>
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.title}>Saldo em Conta</Text>
        <Ionicons name="notifications" size={24} color="#fff" />
      </View> 
      
      <View  >

      {/* Saldo Card */}
      {loadingTotais ? (
        <View style={[styles.card, { backgroundColor:'#292929', borderColor: '#292929', height:200 }, ]}> 

        

       <View  
        style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
          }}>
        <ActivityIndicator size="large" color="#307E89" />  
        <TouchableOpacity style={styles.button} onPress={buscar_dados}>
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
        </View>
        
        
        </View>
      ) : (
        <FlatList 
            data={dadosTotais}
            renderItem={cards}
            keyExtractor={(item) => item.nome}
            horizontal={true} // Define a rolagem horizontal
            showsHorizontalScrollIndicator={false} // Oculta a barra de rolagem horizontal
             />
      )}

      
            
       </View>

       
       
      {/* Funções do Dia a Dia */}

       <View >

      {loadingTrampo ? (
        <View style={styles.features}> 
        
        
            
                <ActivityIndicator size="large" color="#307E89" />  

          <View  
          style={{
                flex: 1,                
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            <TouchableOpacity style={[styles.button ]}  onPress={buscar_dados}>
              
              <Text style={styles.buttonText} >
                Tentar Novamente
              </Text>
            </TouchableOpacity>
          </View>

          <ActivityIndicator size="large" color="#307E89" />           
          
        
        </View>
        
      ) : (
        <FlatList 
            data={dadosTrampo}
            renderItem={contas}
            keyExtractor={(item, index) => `${item.nome}_${index}`}
            horizontal={true} // Define a rolagem horizontal
            showsHorizontalScrollIndicator={false} // Oculta a barra de rolagem horizontal
             />
      )}        
            
             
       </View>

       <View style={styles.viewpadrao}>
          <Text style={styles.textpadrao}> VALORES</Text>

          <TouchableOpacity onPress={valoresModal}>
              <View style={styles.addvalores}>
                <Ionicons name="add" size={40} color="#fff" />
                
              </View>
            
          </TouchableOpacity>
        <View>

        </View>

       </View>

       </View>
       
      <View style={styles.botoomfixo}>


      {/* Inputs */}
       <View >
        <View>

            {loadingTransacao ? (
              <View style={styles.cardvalue}>

              <View  
                style={{
                      flex: 1,
                      backgroundColor:'#161616',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}>
                <ActivityIndicator size="large" color="#307E89" />   
                <TouchableOpacity style={styles.button} onPress={buscar_dados}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
                </View>
            
            </View>
            ) : (
              <FlatList 
              data={dadosTransacao}
              renderItem={valores}
              keyExtractor={(item) => item.id.toString()}
              horizontal={false} // Define a rolagem horizontal
              showsHorizontalScrollIndicator={false} // Oculta a barra de rolagem horizontal
              />
            )}
        
            
       </View>  
       </View> 
       </View>    
      
    </View>
    <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleProfileModal}
      >
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' , flex: 1}}  onPress={toggleProfileModal} >
        </TouchableOpacity>
        <View style={{ position: 'fixed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(188, 26, 26, 0)' , flex: 1, marginHorizontal: 0, marginVertical: '90%'}}>
            
        <View style={styles.cardvalue}>
      <View style={styles.inputsvalores}>  

      
        

      <View style={styles.inputSection}>
        <TextInput
          style={[styles.input]}
          placeholder={' '}          
          placeholderTextColor="#ccc"
          onChangeText={(text) => setFormTrampo({ ...formTrampo, nome: text })}
        />
        
        
      </View>
      
      </View>
      
      {/* Botões */}       
          <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor:  '#5fe643c2'  },
                ]}
                onPress={SubmitTrampo}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={idValoreModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={valoresModal}
      >
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' , flex: 1}}  onPress={valoresModal} >
        </TouchableOpacity>
        <View style={{ position: 'fixed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(181, 31, 31, 0)' , flex: 1, marginHorizontal: 0, marginVertical: '90%'}}>
            
        <View style={styles.cardvalue}>
      <View style={styles.inputsvalores}>  

      
        <View style={styles.inputSection}> 
            <Picker style={styles.picker} onValueChange={(itemValue) => setFormTransacao({ ...formTransacao, nome_trampo: itemValue })}>
              {dadosTrampo.map((contas) => (
                <Picker.Item key={contas.id}   color='black' label={contas.nome} value={contas.nome} />
              ))}
            </Picker> 
        </View>   

      <View style={styles.inputSection}>
        <TextInput
          style={[styles.input]}
          placeholder={'0.00'}          
          placeholderTextColor="#ccc"
          keyboardType="numeric"
          onChangeText={(text) => setFormTransacao({ ...formTransacao, valor: text })}
        />
        
        
      </View>
      
      </View>
      
      {/* Botões */}       
          <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor:  '#5fe643c2'  },
                ]}
                onPress={SubmitTransacao}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:  "#fff",
  },
  topfixo:{
    flex: 0.5,
    zIndex: 1, 
    backgroundColor: '#161616',   
    
  },
  botoomfixo:{ 
    position:'absolute',
    flex: 0.5,
    top: '57%',
    left: 1,
    right: 1,
    bottom: 1,

  },
  card: {
    width: 310,
    backgroundColor: '#292929',
    borderWidth: 3,
    borderRadius: 10,
    padding: 25,
    margin: 10,
  },
  balanceText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  datavalue: {
    fontSize: 20,
    color: '#fff'

  },
  button: {
    backgroundColor: '#cccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#292929',
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 5,
    margin: 10,    
    borderRadius: 5,
    backgroundColor: "#292929",
  },
  featureButton: {
    alignItems: 'center',
  },
  featureText: {
    marginTop: 8,
    fontSize: 17,
    color: '#fff'
  },
  viewpadrao:{
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexDirection: 'row',
    marginBottom: 15,

  },
  textpadrao:{
    color: '#fff',
    fontSize: 20,
    fontStyle: 'italic'

  },
  addvalores:{
    left: 90,
    width: 'auto',
    marginRight: 20,
    
  },
  inputSection: {
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  cardvalue:{
    flexDirection: 'row',  
    justifyContent: 'center',
    backgroundColor: '#292929',
    borderRadius: 20,
    margin: 5,


  },
  inputsvalores:{
    flexDirection: 'column',  
    justifyContent: 'center',
    borderRadius: 20,
    flex: 1,
  },
  picker: {
    textAlign: 'center',
    fontSize: 20,
    height: 50,
    width: '100%',
    backgroundColor: '#ffffff00',   
    borderColor: '#ffffff00',
    color: '#fff',
  },
  input: {
    textAlign: 'center',
    height: 60,
    width: "40%",
    backgroundColor: '#ffffff00',   
    borderColor: '#ffffff00',
    paddingHorizontal: 5,
    fontSize: 26,
    borderWidth: 1,
    color: '#fff',
    outlineStyle: "none",   
  },
  buttonSection: {
    flexDirection: 'column',
    justifyContent: 'center',        
    width: '30%',
  },
  editButton: {
    alignItems:'center', 
    justifyContent: 'center',
    padding: 20,    
    borderTopRightRadius: 8,
    flex: 1,
  },
  editButtonText: {
    
    position: 'absolute',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    padding: 10,
    borderBottomRightRadius: 8,
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
