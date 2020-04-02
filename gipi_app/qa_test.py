import re


def parser(user_question):
    this_dict = {}

    search_location = re.match('cand.*la (.+)', user_question, re.IGNORECASE)
    search_time = re.match('unde.*la (.+)', user_question, re.IGNORECASE)

    if search_location is None and search_time is None:
        search_general = re.match('.*la (.+)', user_question, re.IGNORECASE)

        if search_general is None:
            return "Speech is unintelligible."

        time_from_general = re.match('[0-9:]+', search_general.group(1))

        if time_from_general is not None:
            this_dict['time'] = time_from_general.group(0)
        else:
            this_dict['location'] = search_general.group(1)

    if search_location is not None:
        location = search_location.group(1)
        this_dict['location'] = location
    elif search_time is not None:
        time = search_time.group(1)
        this_dict['time'] = time

    return this_dict


assert parser('cand am fost la biserica') == {'location': 'biserica'}
assert parser('unde am fost la 12:00') == {'time': '12:00'}
assert parser('cand am fost la facultatea de informatica Iasi') == {'location': 'facultatea de informatica Iasi'}
assert parser('cand am fost la strada atelierului nr 4') == {'location': 'strada atelierului nr 4'}
assert parser('unde am fost la 14:30') == {'time': '14:30'}
assert parser('unde am fost la 2') == {'time': '2'}
assert parser('unde am fost la 22') == {'time': '22'}
assert parser('fost la biserica') == {'location': 'biserica'}
assert parser('am fost la 12:00') == {'time': '12:00'}
assert parser('la facultatea de informatica Iasi') == {'location': 'facultatea de informatica Iasi'}
assert parser('st la 22') == {'time': '22'}
