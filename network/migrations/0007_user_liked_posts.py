# Generated by Django 3.0.8 on 2021-02-26 20:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_auto_20210226_1800'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='liked_posts',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.PROTECT, related_name='liked_by', to='network.Post'),
        ),
    ]
