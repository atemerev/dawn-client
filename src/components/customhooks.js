import React, { useState } from 'react'

const useForm = (initialState, callback) => {
    const [inputs, setInputs] = useState(initialState)

    const handleSubmit = (event) => {
        if (event) {
            event.preventDefault()
        }
        callback(inputs)
    }

    const handleInputChange = (event) => {
        if (event) {
            event.persist()
            setInputs(inputs => ({...inputs, [event.target.name]: event.target.value}))
        }
    }
    return {handleSubmit, handleInputChange, inputs}
}

export default useForm