import React, {useState, useEffect} from 'react'
import {SketchPicker} from 'react-color'
import {Input, Button } from 'antd'
import {DataStore} from '@aws-amplify/datastore'
import {Message} from './models'

//initial state property as a string color black
const initialState = {color:'#000000', title: '',}

function App(){
  const [formState, updateFormState] = useState(initialState) //form state to hold form state
  const [messages, updateMessages] = useState([]) //messages array to store messages
  const [showPicker, updateShowPicker] = useState(false) //show and hide color picker with bool

  useEffect(() =>{
    fetchMessages()
    const subscription = DataStore.observe(Message).subscribe(() => fetchMessages()) //new subscription passing message model
    return () => subscription.unsubscribe() //update ui with new message
  })

  //onchange handler to detemrine if the color is a hex color
  function onChange(e){
    if(e.hex){
      updateFormState({ ...formState, color: e.hex}) //know comes from color picker and update color proerty
    }else {updateFormState({ ...formState, title: e.target.value})} //if not update title proeprty
  }
  async function fetchMessages(){
    const messages = await DataStore.query(Message) //pass in the message model
    updateMessages(messages) // call update message by passing in the messages array
  }
  async function createMessage(){
    if (!formState.title) return //check if the title is not empty
    await DataStore.save(new Message ({...formState})) //if not empty will pass in the new mesage and form state
    updateFormState(initialState) // pass in init state to clear the form 
  }
  return(
    <div style={container}>
      <h1 style={heading}>Real time message board</h1>
      <Input
        onChange={onChange}
        name='title'
        placeholder='Message title'
        value={formState.title}
        style={input}
      />
      <div>
        <Button onClick={() => updateShowPicker(!showPicker)} style={button}>Toggle Color Picker</Button>
        <p>Color: <span style={{fontWeight: 'bold', color: formState.color}}>{formState.color}</span></p>
      </div>
      {
        showPicker && <SketchPicker color={formState.color} onChange={onChange} />
      }
      <Button type='primary' onClick={createMessage}>Create Message</Button>
      {
        messages.map(message => (
          <div key={message.id} style={{...messageStyle, backgroundColor: message.color}}>
            <div style={messageBg}>
              <p style={messageTitle}>{message.title}</p>
            </div>
          </div>
        ))
      }
    </div>
  )
}

const container = {width: '100%', padding: 40, maxWidth: 900}
const input = {marginBottom: 10}
const button = {marginBottom: 10}
const heading = {fontWeight:'normal', fontSize:40}
const messageBg= {backgroundColor:'white'}
const messageStyle= {padding:'20px', marginTop:7, borderRadius: 4}
const messageTitle= {margin:0, padding:9, fontSize: 20}

export default App;