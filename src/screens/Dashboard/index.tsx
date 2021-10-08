import React, { useCallback, useState, useEffect } from 'react'
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from 'styled-components';
import { useFocusEffect } from '@react-navigation/native';

import { HighlightCard } from '../../components/HighlightCard'
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard'

import {
  Container,
  Header,
  UserWraper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionsList,
  LogoutButton, 
  LoadContainer
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}
export function Dashboard() {
  const [isLoading, setIsloading] = useState(true);
  const theme = useTheme();
  const [data, setDate] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  async function loadTransactions() {
    const dataKey = '@gofinance:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((item: DataListProps) => {

        if (item.type === 'positive') {
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount)
        }

        const amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }
      });

    setDate(transactionsFormatted);
    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      }
    });

    setIsloading(false);
  }

  useEffect(() => {
    loadTransactions();
    //    const dataKey = '@gofinance:transactions';
    //    AsyncStorage.removeItem(dataKey);
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>
      
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator
            color={theme.colors.primary} 
            size="large"
          />
        </LoadContainer> : 
      <>
        <Header>
          <UserWraper>
            <UserInfo>
              <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/12415391?v=4' }} />
              <User>
                <UserGreeting>Olá,</UserGreeting>
                <UserName>Osmair</UserName>
              </User>
            </UserInfo>

            <LogoutButton onPress={() => { }}>
              <Icon name="power" />
            </LogoutButton>
          </UserWraper>
        </Header>

        <HighlightCards>
          <HighlightCard
            type="up"
            title="Entrada"
            amount={highlightData.entries.amount}
            lastTransaction="Última entrada dia 13 de abril"
          />
          <HighlightCard
            type="down"
            title="Saida"
            amount={highlightData.expensives.amount}
            lastTransaction="Última saida dia 03 de abril"
          />
          <HighlightCard
            type="total"
            title={highlightData.total.amount}
            amount="R$ 16.141,00"
            lastTransaction="01 a 16 de abril"
          />
        </HighlightCards>

        <Transactions>
          <Title>Listagem</Title>
          <TransactionsList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TransactionCard data={item} />}
          />
        </Transactions>
      </>
      }
    </Container>
  )
}
