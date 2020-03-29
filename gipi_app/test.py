from time import strptime
import datetime

def compute_time(s_time):
    input_data =strptime(s_time,"%H:%M")
    currentDT = datetime.datetime.now()
    print(str(currentDT.replace(hour=input_data.tm_hour,minute=input_data.tm_min)))
    bad_data = datetime.datetime.now()
    good_data = datetime.datetime.now()

#2020-03-26 19:26:35.051711
print(compute_time("14:20"))

