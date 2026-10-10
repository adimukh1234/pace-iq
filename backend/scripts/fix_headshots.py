import sqlite3

CANONICAL_HEADSHOTS = {
    'NOR': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
    'VER': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
    'HAM': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
    'LEC': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
    'PIA': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png',
    'RUS': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png',
    'SAI': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
    'PER': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png',
    'ALO': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png',
    'STR': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png',
    'TSU': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png',
    'GAS': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png',
    'ALB': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png',
    'HUL': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png',
    'OCO': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png',
    'MAG': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png',
    'BOT': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png',
    'ZHO': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/1col/image.png',
    'SAR': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png',
    'RIC': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/1col/image.png',
    'LAW': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png',
    'BEA': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png',
    'COL': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png',
    'ANT': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png.transform/1col/image.png',
    'DOO': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png.transform/1col/image.png',
    'HAD': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png',
    'BOR': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png',
    'VET': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png.transform/1col/image.png',
    'RAI': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KIMRAI01_Kimi_Raikkonen/kimrai01.png.transform/1col/image.png',
    'LAT': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICLAT01_Nicholas_Latifi/niclat01.png.transform/1col/image.png',
    'MSC': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MICSCH01_Mick_Schumacher/micsch01.png.transform/1col/image.png',
    'MAZ': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NIKMAZ01_Nikita_Mazepin/nikmaz01.png.transform/1col/image.png',
    'GIO': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANTGIO01_Antonio_Giovinazzi/antgio01.png.transform/1col/image.png',
    'DEV': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NYCDEV01_Nyck_De_Vries/nycdev01.png.transform/1col/image.png'
}

NAME_KEYWORDS = {
    'norris': CANONICAL_HEADSHOTS['NOR'],
    'verstappen': CANONICAL_HEADSHOTS['VER'],
    'hamilton': CANONICAL_HEADSHOTS['HAM'],
    'leclerc': CANONICAL_HEADSHOTS['LEC'],
    'piastri': CANONICAL_HEADSHOTS['PIA'],
    'russell': CANONICAL_HEADSHOTS['RUS'],
    'sainz': CANONICAL_HEADSHOTS['SAI'],
    'perez': CANONICAL_HEADSHOTS['PER'],
    'alonso': CANONICAL_HEADSHOTS['ALO'],
    'stroll': CANONICAL_HEADSHOTS['STR'],
    'tsunoda': CANONICAL_HEADSHOTS['TSU'],
    'gasly': CANONICAL_HEADSHOTS['GAS'],
    'albon': CANONICAL_HEADSHOTS['ALB'],
    'hulkenberg': CANONICAL_HEADSHOTS['HUL'],
    'ocon': CANONICAL_HEADSHOTS['OCO'],
    'magnussen': CANONICAL_HEADSHOTS['MAG'],
    'bottas': CANONICAL_HEADSHOTS['BOT'],
    'zhou': CANONICAL_HEADSHOTS['ZHO'],
    'sargeant': CANONICAL_HEADSHOTS['SAR'],
    'ricciardo': CANONICAL_HEADSHOTS['RIC'],
    'lawson': CANONICAL_HEADSHOTS['LAW'],
    'bearman': CANONICAL_HEADSHOTS['BEA'],
    'colapinto': CANONICAL_HEADSHOTS['COL'],
    'antonelli': CANONICAL_HEADSHOTS['ANT'],
    'doohan': CANONICAL_HEADSHOTS['DOO'],
    'hadjar': CANONICAL_HEADSHOTS['HAD'],
    'bortoleto': CANONICAL_HEADSHOTS['BOR'],
    'vettel': CANONICAL_HEADSHOTS['VET'],
    'raikkonen': CANONICAL_HEADSHOTS['RAI'],
    'latifi': CANONICAL_HEADSHOTS['LAT'],
    'schumacher': CANONICAL_HEADSHOTS['MSC'],
    'mazepin': CANONICAL_HEADSHOTS['MAZ'],
    'giovinazzi': CANONICAL_HEADSHOTS['GIO'],
    'vries': CANONICAL_HEADSHOTS['DEV']
}

def run_fix():
    conn = sqlite3.connect('backend/data/paceiq.db')
    cur = conn.cursor()

    # 1. Update by acronym first (primary driver identity)
    for acr, url in CANONICAL_HEADSHOTS.items():
        cur.execute('UPDATE drivers SET headshot_url = ? WHERE UPPER(name_acronym) = ?', (url, acr))

    # 2. Update by surname keywords (guarantees Norris gets Norris, even when driving car #1 in 2026)
    for kw, url in NAME_KEYWORDS.items():
        cur.execute('UPDATE drivers SET headshot_url = ? WHERE LOWER(full_name) LIKE ?', (url, f'%{kw}%'))

    conn.commit()

    # Check for mismatches
    cur.execute('''
        SELECT DISTINCT driver_number, name_acronym, full_name, headshot_url
        FROM drivers
        WHERE headshot_url IS NOT NULL
    ''')
    rows = cur.fetchall()
    mismatches = []
    for num, acr, name, url in rows:
        surname = name.split()[-1].upper() if name else ''
        if surname and surname not in url.upper() and acr not in url.upper():
            mismatches.append((num, acr, name, url))

    print(f'Total distinct combinations: {len(rows)}')
    print(f'Mismatches remaining: {len(mismatches)}')
    for m in mismatches:
        print('Mismatch:', m)

    # Print Norris verification
    cur.execute('SELECT DISTINCT driver_number, name_acronym, full_name, headshot_url FROM drivers WHERE LOWER(full_name) LIKE "%norris%"')
    print('Norris verification:')
    for r in cur.fetchall():
        print(r)

if __name__ == '__main__':
    run_fix()
