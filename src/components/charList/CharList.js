import './charList.scss';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';

import { useState, useEffect, useRef } from 'react';

const setContent = (process, Component, newItemLoading) => {
    switch (process) {
        case 'waiting':
            return  <Spinner/>;
            break;
        case 'loading':
            return newItemLoading ? <Component/> : <Spinner/>;
            break;
        case 'confirmed':
            return <Component/>;
            break;
        case 'error':
            return <ErrorMessage/>;
            break;
        default:
            throw new Error('Something wrong');
    }
}



const CharList = (props) => {

    const [charList, setCharList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(1541);
    const [charEnded, setCharEnded] = useState(false);

    const {loading, error, getAllCharacters, process, setProcess} = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])


   const onRequest = (offset, initial) => {
       initial ? setNewItemLoading(false) : setNewItemLoading(true);
       getAllCharacters(offset)
        .then(onCharListLoaded)
        .then(() => setProcess('confirmed'));
    }

   const onCharListLoaded = (newCharList) => {
        let ended = false;
        if(newCharList.length < 9) {
            ended = true;
        }

        setCharList(charList => [...charList, ...newCharList]);
        setNewItemLoading(newItemLoading => false);
        setOffset(offset => offset + 9);
        setCharEnded(charEnded => ended);
    }


   const itemsRefs = useRef([]);

 

   const  focusOnItem = (id) => {
        itemsRefs.current.forEach(item => item.classList.remove('char__item_selected'));
        itemsRefs.current[id].classList.add('char__item_selected');
        itemsRefs.current[id].focus();
    }

    function renderItems(arr) {
        const items = arr.map((item, i) => {
            let imgStyle = {'objectFit' : 'cover'};
            if (item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg') {
                imgStyle = {'objectFit' : 'unset'};
            }
            return (
                <li className='char__item'
                    tabIndex={0}
                    ref={el => itemsRefs.current[i] = el}
                    key={item.id}
                    onClick={() => {
                        props.onCharSelected(item.id)
                        focusOnItem(i);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === '' || e.key === "Enter") {
                            props.onCharListLoaded(item.id);
                            focusOnItem(i);
                        }
                    }}
                    >
                    <img src={item.thumbnail} alt={item.name} style={imgStyle} />
                    <div className="char__name">{item.name}</div>
                </li>
            )
        });

        return (
            <ul className='char__grid'>
                {items}
            </ul>
        )
    }



    return (
        <div className="char__list">
            {setContent(process, () => renderItems(charList), newItemLoading)}
            <button 
            className="button button__main button__long"
            disabled={newItemLoading}
            style={{'display' : charEnded ? 'none' : "block"}}
            onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}


export default CharList;