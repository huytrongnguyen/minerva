from os import path

class JobSettings:
    def __init__(self):
        self.product_id = ''
        self.event_date = ''
        self.action = ''
        self.layouts = ''
        self.config_dir = '../../products'

    @classmethod
    def parse(cls, args: list[str]):
        CURRENT_DIR = path.dirname(__file__)
        print(f'CURRENT_DIR = {CURRENT_DIR}')

        job_settings = cls()

        for pair in args:
            entry = pair.split('=', 1) # Split on first '=' only
            if len(entry) >= 2:
                if entry[0] == 'product_id':
                    job_settings.product_id = entry[1]
                elif entry[0] == 'event_date':
                    job_settings.event_date = entry[1]
                elif entry[0] == 'action':
                    job_settings.action = entry[1]
                elif entry[0] == 'layouts':
                    job_settings.layouts = entry[1]
                else:
                    print(f'Unknown field: {entry[0]}')

        return job_settings