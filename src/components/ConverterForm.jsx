import React, { useEffect, useState } from 'react'
import Freecurrencyapi from '@everapi/freecurrencyapi-js'

const ConverterForm = () => {
    const freecurrencyapi = new Freecurrencyapi(process.env.REACT_APP_API_KEY);
    
    const savedCurrencies = localStorage.getItem("currencies");
    const [currencies, setCurrencies] = useState("");
    
    const [baseAmount, setBaseAmount] = useState(0);
    const [baseCurrency, setBaseCurrency] = useState("USD");
    
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [convertedCurrency, setConvertedCurrency] = useState("EUR");

    const [exchangeRate, setExchangeRate] = useState(0);
    
    useEffect(() => {
        if(!savedCurrencies) {
            freecurrencyapi.currencies().then(({data}) => {
                localStorage.setItem("currencies",JSON.stringify(data))
                setCurrencies(data);
            });
        }
        else {
            setCurrencies(JSON.parse(savedCurrencies));
        }
        convertCurrency()
    }, []);
        
    useEffect(() => {
        if(baseAmount) {
            convertCurrency();
        }
    }, [baseAmount,baseCurrency,convertedCurrency]);

    const convertCurrency = () => {
        freecurrencyapi.latest({
            base_currency: baseCurrency,
            currencies: convertedCurrency 
        }).then(({data}) => {
            const rate = Number(data[convertedCurrency]);
            setExchangeRate(rate);
            setConvertedAmount((Number(baseAmount) * rate).toFixed(2));
        });

    }

    const handleInput = (event) => {
        event.target.value = event.target.value.replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1')
            .replace(/^0+(\d)/, '$1')
            .match(/^\d*(\.\d{0,2})?/)?.[0] || ''; 
        setBaseAmount(event.target.value);
    }

    const handleSelectCurrency = (e, dropdown) => {
        if (dropdown === 1) {
            if(e.target.value === convertedCurrency) {
                setConvertedCurrency(baseCurrency);
                setBaseCurrency(e.target.value);
            }
            else {
                setBaseCurrency(e.target.value);
            }
        }
        else {
            if(e.target.value === baseCurrency) {
                setBaseCurrency(convertedCurrency);
                setConvertedCurrency(e.target.value);
            }
            else {
                setConvertedCurrency(e.target.value);
            }
        }
    }

    return (
    <div className="container">
        <p className="app-title">
            Currency Converter App
        </p>
        <div className="converter">
            <div className="converter-input">
                <label htmlFor="baseValue" className='input-overlay-text'>Base Amount</label>
                <input type="text" name="baseValue" id="baseValue" value={baseAmount} onInput={e => handleInput(e)}/>
                <div className="currency-dropdown">
                    <label htmlFor="currencyList" className='input-overlay-text'>From Currency</label>
                    <select name="currencyList" id="currencyList" value={baseCurrency} onChange={e => handleSelectCurrency(e, 1)}>
                        {Object.entries(currencies).sort().map(([currency, details]) => {
                            return <option value={details.code} key={details.code}>({currency}) {details.name}</option>
                        })
                        
                    }
                    </select>
                </div>
            </div>
            <div className="converter-input">
                <label htmlFor="convertedValue" className='input-overlay-text'>Converted Amount</label>
                <input type="text" name="convertedValue" id="convertedValue" value={convertedAmount} readOnly/>
                <div className="currency-dropdown">
                    <label htmlFor="currencyList" className='input-overlay-text'>To Currency</label>
                    <select name="currencyList" id="currencyList" value={convertedCurrency} onChange={e => handleSelectCurrency(e, 2)}>
                        {Object.entries(currencies).map(([currency, details]) => {
                                return <option value={details.code} key={details.code}>({currency}) {details.name}</option>
                        })
                        
                    }
                    </select>
                </div>
            </div>
            <div className="footer">
                1 {baseCurrency} is equal to {exchangeRate} {convertedCurrency}
            </div>
        </div>
    </div>
    )
}

export default ConverterForm