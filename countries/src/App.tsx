import React, { useState, useEffect } from 'react';
import './App.css';
interface User {
  name: {
    first: string;
    last: string;
  };
  gender: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  registered: {
    date: string;
  };
}

interface Country {
  name: string;
  userCount: number;
  users: User[];
}

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [genderFilter, setGenderFilter] = useState<string>('All');

  useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://randomuser.me/api/?results=100', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const users: User[] = data.results;
        const groupedByCountry: { [key: string]: User[] } = users.reduce((acc: { [key: string]: User[] }, user) => {
          const country = user.location.country;

          acc[country] = acc[country] || [];
          acc[country].push(user);
          return acc;
        }, {});

        const countriesArray: Country[] = Object.keys(groupedByCountry).map((country) => ({
          name: country,
          userCount: groupedByCountry[country].length,
          users: groupedByCountry[country],
        }));

        countriesArray.sort((a, b) => b.userCount - a.userCount);
        setCountries(countriesArray);
      }
    };
    xhr.send();
  }, []);

  const handleCountryClick = (country: Country): void => {
    setSelectedCountry(country);
    const sortedUsers: User[] = country.users.sort((a, b) => new Date(b.registered.date).getTime() - new Date(a.registered.date).getTime());
    setFilteredUsers(sortedUsers);
  };

  const handleGenderFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setGenderFilter(e.target.value);
    let filteredUsers = selectedCountry ? selectedCountry.users : [];
    if (e.target.value !== 'All') {
      filteredUsers = selectedCountry ? selectedCountry.users.filter(user => user.gender === e.target.value) : [];
    }
    filteredUsers.sort((a, b) => new Date(b.registered.date).getTime() - new Date(a.registered.date).getTime());
    setFilteredUsers(filteredUsers);
  };

  return (
    <main className='main'>
      <div className='left'>
      <h1>列表</h1>
      <ul className='left-ul'>
        {countries.map((country, index) => (
          <li key={index} onClick={() => handleCountryClick(country)}>
            {country.name} - {country.userCount}
          </li>
        ))}
      </ul>
      </div>
      <div className='right'>
      <h1>详情</h1>
      {selectedCountry && (
        <div>
          <h2>{selectedCountry.name} 用户</h2>
          性别：<select value={genderFilter} onChange={handleGenderFilterChange}>
            <option value="All">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <ul>
            {filteredUsers.map((user, index) => (
              <li key={index}>
                <p>Name: {user.name.first} {user.name.last}</p>
                <p>Gender: {user.gender}</p>
                <p>City: {user.location.city}</p>
                <p>State: {user.location.state}</p>
                <p>Date Registered: {new Date(user.registered.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>

    </main>
  );
}

export default App;
