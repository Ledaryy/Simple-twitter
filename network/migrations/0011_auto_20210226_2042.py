# Generated by Django 3.0.8 on 2021-02-26 20:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0010_auto_20210226_2041'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='likedPosts',
            new_name='liked_posts',
        ),
    ]
