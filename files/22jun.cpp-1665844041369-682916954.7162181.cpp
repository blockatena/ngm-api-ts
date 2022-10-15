An array is called “X - Mas”, if no two adjacent elements have sum strictly greater than X.

                                      You are given an array A of N integers.In one operation you can select a K(1 <= K <= N) such that AK
                                      > 0 and
                                  decrease AK by 1.

                                  For the given value of X,
    find the minimum number of operations required to make A, a X - Mas array.

// You are given T independent test cases.

// Constraints

// 1 <= T <= 10
// 1 <= N <= 105
// 1 <= Ai <= 109
// 0 <= X <= 109
// All input values are integers.
// Input Format

// First-line contains T.
// First line of each test case consists of two space separated integers N and X.
// Second line contains N space separated integers denoting the array A.
// Output Format

// Print in a newline for each test case a single integer denoting the minimum number of operations required to make array A, a X-Mas array.
// Sample Input 1

// 1

// 3 3

// 2 2 2

// Sample Output 1

// 1

#include <iostream>

                                                                    using namespace std;

int main()
{
    int T;
    cin >> T;
    int i, j;
    int count = 0;
    while (T > 0)
    {
        count = 0;
        int N;
        cin >> N;
        int X;
        cin >> X;
        int A[N];
        for (i = 0; i < N; i++)
        {
            cin >> A[i];
        }

        for (i = 0; i < N - 1; i++)
        {
            for (j = 0; j < N; j++)
            {
                if (A[i] + A[j] <= X)
                {
                    continue;
                }
                else
                {
                    int min_index = A[i] < A[j] ? i : j;
                    if (A[i] == A[j])
                    {
                        min_index = j;
                    }
                    A[min_index] -= 1;
                    count++;
                }
            }
        }
        T--;
        cout << count;
    }
    return 0;
}