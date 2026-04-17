import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Сохранение и получение заявок на вывод золотых орлов."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        if event.get('httpMethod') == 'POST':
            raw_body = event.get('body') or '{}'
            parsed = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            body = json.loads(parsed) if isinstance(parsed, str) else parsed
            nickname = body.get('nickname', '').strip()
            amount = int(body.get('amount', 0))
            method = body.get('method', '').strip()

            if not nickname or len(nickname) < 3:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Никнейм должен содержать минимум 3 символа'})
                }
            if amount < 150:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Минимальная сумма вывода — 150 орлов'})
                }
            if method not in ('gaijin', 'pixelstorm'):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный метод вывода'})
                }

            cur.execute(
                "INSERT INTO withdraw_requests (nickname, amount, method) VALUES (%s, %s, %s) RETURNING id, created_at",
                (nickname, amount, method)
            )
            row = cur.fetchone()
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'id': row[0],
                    'created_at': row[1].isoformat()
                })
            }

        if event.get('httpMethod') == 'GET':
            cur.execute(
                "SELECT id, nickname, amount, method, status, created_at FROM withdraw_requests ORDER BY created_at DESC LIMIT 100"
            )
            rows = cur.fetchall()
            requests = [
                {
                    'id': r[0],
                    'nickname': r[1],
                    'amount': r[2],
                    'method': r[3],
                    'status': r[4],
                    'created_at': r[5].isoformat()
                }
                for r in rows
            ]
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'requests': requests})
            }

        if event.get('httpMethod') == 'PUT':
            raw_body = event.get('body') or '{}'
            parsed = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
            body = json.loads(parsed) if isinstance(parsed, str) else parsed
            request_id = int(body.get('id', 0))
            new_status = body.get('status', '').strip()

            if new_status not in ('pending', 'done', 'rejected'):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный статус'})
                }

            cur.execute(
                "UPDATE withdraw_requests SET status = %s WHERE id = %s RETURNING id",
                (new_status, request_id)
            )
            updated = cur.fetchone()
            conn.commit()

            if not updated:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заявка не найдена'})
                }

            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }

    finally:
        cur.close()
        conn.close()

    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }