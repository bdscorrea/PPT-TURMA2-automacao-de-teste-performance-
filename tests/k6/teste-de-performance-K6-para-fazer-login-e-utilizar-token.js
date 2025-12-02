import http from 'k6/http';
import { sleep, check, group } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(90)<=2', 'p(95)<=3'],
    http_req_failed: ['rate<0.01']
  }
};

export default function() {
    let responseInstructorLogin = '';
    group ('Fazendo login', () => {
        responseInstructorLogin = http.post(
            'http://localhost:3000/instructors/login', 
            JSON.stringify({ 
                email: 'bea@pgats.com',
                password: '123456'
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    })

    let responseLesson = '';
    group ('Registrando uma nova lição', () => {
        responseLesson = http.post(
        'http://localhost:3000/lessons', 
        JSON.stringify({ 
            title: 'Teste PGATS',
            description: 'Montando testes K6'
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${responseInstructorLogin.json('token')}`
            }
        });

        check(responseLesson, { 
            'status is 201': (res) => res.status === 201
        });
    })

    group ('Registrando uma progresso', () => {
        let responseProgress = http.post(
        'http://localhost:3000/progress', 
        JSON.stringify({ 
            studentId: '1',
            lessonId: responseLesson.json('id')
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${responseInstructorLogin.json('token')}`
            }
        });

        check(responseProgress, { 
            'status is 201': (res) => res.status === 201
        });
    })

    let responseAlunoLogin = '';
    group ('Fazendo Login Aluno', () => {
        responseAlunoLogin = http.post(
        'http://localhost:3000/students/login', 
        JSON.stringify({ 
            email: 'aluno@pgats.com',
            password: '123456'
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        check(responseAlunoLogin, { 
        'status is 200': (res) => res.status === 200
        });
    })


    group ('Consultando progresso', () => {
        let responseProgressStudent = http.get(
        'http://localhost:3000/students/progress/1', 
        {
            headers: {
                'Authorization': `Bearer ${responseAlunoLogin.json('token')}`
            }
        });

        check(responseProgressStudent, { 
            'status is 200': (res) => res.status === 200
        });
    })

    group ('Simulando o pensamento do usuário', () => {
        sleep(1);
    })
}
