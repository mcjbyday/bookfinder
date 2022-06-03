import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
// import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  
  const { loading, data } = useQuery(GET_ME);
  
  const meData = data?.me || [];

  const [userData, setUserData] = useState(meData);
  
  const [deleteBook, { error }] = useMutation(REMOVE_BOOK);

  // // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    // // If there is no `profileId` in the URL as a parameter, execute the `GET_ME` query instead for the logged in user's information
    // const { loading, data } = useQuery(
    //   profileId ? QUERY_SINGLE_PROFILE : GET_ME,
    //   {
    //     variables: { profileId: profileId },
    //   }
    // );

    // // Check if data is returning from the `GET_ME` query, then the `QUERY_SINGLE_PROFILE` query
    // const profile = data?.me || data?.profile || {};


    // 
    // const { loading, data } = useQuery(userParam ? QUERY_USER : GET_ME, {
    //   variables: { username: userParam },
    // });

    try {
      const updatedUser = await deleteBook(bookId, token);

      setUserData(updatedUser);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
